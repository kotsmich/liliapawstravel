import { Injectable, DestroyRef, computed, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TranslocoService } from '@jsverse/transloco';
import { Dog } from '@models/lib/dog.model';
import { addDog, addDogs, updateDog, deleteDog, deleteDogs, loadTripById } from '@admin/features/trips/store';
import { DogsService } from '@admin/services/dogs.service';
import { ConfirmActionService } from '@admin/shared/services/confirm-action.service';
import { requesterRequiredValidator } from '@admin/shared/validators/requester-required.validator';
import { DogDialogService } from './dog-dialog.service';
import { DogSelectionStore } from './dog-selection.store';
import { dogGroup } from './dog-form.factory';

type IndexedDog = Dog & { _idx: number };

interface RequesterFormValue {
  requesterId: string | null;
  requesterKey: string | null;
  newRequesterName: string | null;
}

/**
 * Owns side-effectful dog operations: NgRx dispatches, confirm dialogs, and the
 * post-save file-upload flow. The shared dogs FormArray is supplied via attach()
 * (it lives on DogManagerService so the trip form can bind to it directly).
 */
@Injectable()
export class DogActionsService {
  private readonly store = inject(Store);
  private readonly confirm = inject(ConfirmActionService);
  private readonly transloco = inject(TranslocoService);
  private readonly dogsService = inject(DogsService);
  private readonly dialog = inject(DogDialogService);
  private readonly selection = inject(DogSelectionStore);
  private readonly destroyRef = inject(DestroyRef);

  /** Single requester applied to every dog in a bulk-add batch. */
  readonly requesterForm = new FormGroup({
    requesterId:      new FormControl<string | null>(null),
    requesterKey:     new FormControl<string | null>(null),
    newRequesterName: new FormControl<string | null>(null),
  }, { validators: requesterRequiredValidator });

  private readonly _requesterFormValue = toSignal(
    this.requesterForm.valueChanges,
    { initialValue: this.requesterForm.value as RequesterFormValue },
  );

  readonly topLevelRequester = computed((): { requesterId?: string; newRequesterName?: string } => {
    const v = this._requesterFormValue();
    if (v.requesterId) return { requesterId: v.requesterId };
    if (v.newRequesterName?.trim()) return { newRequesterName: v.newRequesterName.trim() };
    return {};
  });

  private dogsArray!: FormArray;
  private isEdit = false;
  private editId: string | null = null;

  attach(dogsArray: FormArray): void {
    this.dogsArray = dogsArray;
  }

  init(isEdit: boolean, editId: string | null): void {
    this.isEdit = isEdit;
    this.editId = editId;
  }

  resetRequesterForm(): void {
    this.requesterForm.reset({ requesterId: null, requesterKey: null, newRequesterName: null });
  }

  deleteDog(dog: IndexedDog): void {
    const doRemove = () => {
      if (this.dogsArray.length > dog._idx) {
        this.dogsArray.removeAt(dog._idx);
      }
    };

    if (this.isEdit && this.editId && dog.id) {
      this.confirm.confirm({
        header:      this.transloco.translate('trips.confirm.removeDog.header'),
        message:     this.transloco.translate('trips.confirm.removeDog.message', { name: dog.name }),
        acceptLabel: this.transloco.translate('common.remove'),
        severity:    'danger',
        accept: () => {
          this.store.dispatch(deleteDog({ tripId: this.editId!, dogId: dog.id }));
          doRemove();
        },
      });
    } else {
      doRemove();
    }
  }

  removeSelectedDogs(): void {
    const toRemove = [...this.selection.selectedDogs()];
    if (!toRemove.length) return;

    const dogIdsToDelete = toRemove.map(d => d.id).filter((id): id is string => !!id);
    if (!this.isEdit || !this.editId || !dogIdsToDelete.length) return;

    this.confirm.confirm({
      header:      this.transloco.translate('trips.confirm.removeDogs.header'),
      message:     this.transloco.translate('trips.confirm.removeDogs.message', { count: toRemove.length }),
      acceptLabel: this.transloco.translate('common.remove'),
      severity:    'danger',
      accept: () => {
        this.store.dispatch(deleteDogs({ tripId: this.editId!, dogIds: dogIdsToDelete }));
        this.selection.selectedDogs.set([]);
      },
    });
  }

  onDogSaved(dogs: Dog[]): void {
    const { editingIndex } = this.dialog;
    if (editingIndex !== null) this.saveEditedDog(dogs[0], editingIndex);
    else this.addNewDogs(dogs);
    this.dialog.close();
  }

  private saveEditedDog(dog: Dog, index: number): void {
    if (this.isEdit && this.editId && dog.id) {
      const { photo, document, photoRemoved, documentRemoved } = this.dialog.takePendingFiles();
      const existing = this.dialog.selectedDog();

      const dogToUpdate: Dog = {
        ...dog,
        photoUrl:    photoRemoved    ? null : (existing?.photoUrl    ?? dog.photoUrl    ?? null),
        documentUrl: documentRemoved ? null : (existing?.documentUrl ?? dog.documentUrl ?? null),
      };

      this.store.dispatch(updateDog({ tripId: this.editId, dog: dogToUpdate }));
      this.uploadNewFiles(dog.id, photo, document);
    }
    (this.dogsArray.at(index) as FormGroup).patchValue(dog);
  }

  private addNewDogs(dogs: Dog[]): void {
    const requester = this.topLevelRequester();
    if (this.editId) {
      const payload = dogs.map(({ id: _id, ...rest }) => rest);
      if (payload.length === 1) {
        this.store.dispatch(addDog({ tripId: this.editId, dog: { ...payload[0], ...requester } }));
      } else {
        this.store.dispatch(addDogs({ tripId: this.editId, dogs: payload, ...requester }));
      }
    } else {
      dogs.forEach(d => this.dogsArray.push(dogGroup(d)));
    }
  }

  private uploadNewFiles(dogId: string, photo: File | null, document: File | null): void {
    if (photo) {
      const fd = new FormData();
      fd.append('photo', photo);
      this.dogsService.uploadDogPhoto(dogId, fd)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => { if (this.editId) this.store.dispatch(loadTripById({ id: this.editId })); },
          error: (err) => console.error('Photo upload failed', err),
        });
    }

    if (document) {
      const fd = new FormData();
      fd.append('document', document);
      this.dogsService.uploadDogDocument(dogId, fd)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => { if (this.editId) this.store.dispatch(loadTripById({ id: this.editId })); },
          error: (err) => console.error('Document upload failed', err),
        });
    }
  }
}
