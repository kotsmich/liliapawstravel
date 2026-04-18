import { Injectable, DestroyRef, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { FormBuilder, FormArray, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TranslocoService } from '@jsverse/transloco';
import { Dog } from '@models/lib/dog.model';
import { Trip, TripDestination, TripRequester } from '@models/lib/trip.model';
import { TableAction, TableConfig } from '@models/lib/table-column.interface';
import { addDog, addDogs, updateDog, deleteDog, deleteDogs, loadTripById } from '@admin/features/trips/store';
import { buildDogColumns } from '@admin/features/trips/shared/dog-columns';
import { DogGroup } from '@admin/features/trips/shared/dog-group.model';
import { DogsService } from '@admin/services/dogs.service';
import { ConfirmActionService } from '@admin/shared/services/confirm-action.service';
import { DogDialogService } from './dog-dialog.service';

@Injectable()
export class DogManagerService {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly confirm = inject(ConfirmActionService);
  private readonly transloco = inject(TranslocoService);
  private readonly dogsService = inject(DogsService);
  private readonly destroyRef = inject(DestroyRef);

  /** Exposed so templates and the wrapper component can bind directly. */
  readonly dialog = inject(DogDialogService);

  readonly dogsArray: FormArray = this.fb.array([]);

  private readonly _lang = toSignal(this.transloco.selectTranslation(), { initialValue: null });

  readonly tripRequestors = signal<TripRequester[]>([]);
  readonly tripDestinations = signal<TripDestination[]>([]);
  readonly tripPickupLocations = signal<TripDestination[]>([]);
  readonly selectedDogs = signal<(Dog & { _idx: number })[]>([]);

  readonly dogsData = toSignal(
    this.dogsArray.valueChanges.pipe(
      map((values: Dog[]) => values.map((v, i) => ({ ...v, _idx: i }))),
    ),
    { initialValue: [] as (Dog & { _idx: number })[] },
  );

  readonly dogsPerRequestor = computed(() => {
    const data = this.dogsData();
    const result = new Map<string, (Dog & { _idx: number })[]>();
    this.tripRequestors().forEach(req => {
      result.set(req.requestId ?? req.name, data.filter(dog => req.dogs.some(requestDog => requestDog.id === dog.id)));
    });
    return result;
  });

  readonly dogsPerDestination = computed((): { destination: TripDestination; dogs: (Dog & { _idx: number })[] }[] =>
    this.tripDestinations().map(dest => ({
      destination: dest,
      dogs: this.dogsData().filter(d => d.destinationId === dest.id),
    }))
  );

  readonly dogsPerPickupLocation = computed((): { destination: TripDestination; dogs: (Dog & { _idx: number })[] }[] => {
    const destinations = this.tripPickupLocations();
    const allDogs = this.dogsData();
    const groups = destinations.map(dest => ({
      destination: dest,
      dogs: allDogs.filter(d => d.pickupLocationId === dest.id),
    }));
    const otherDogs = allDogs.filter(d => !d.pickupLocationId);
    if (otherDogs.length > 0) {
      groups.push({ destination: { id: '__other__', name: 'Other' }, dogs: otherDogs });
    }
    return groups;
  });

  readonly requestorGroups = computed((): DogGroup[] => {
    this._lang();
    return this.tripRequestors().map(req => {
      const groupKey = req.requestId ?? req.name;
      const dogs = this.dogsPerRequestor().get(groupKey) ?? [];
      return {
        key: groupKey,
        label: req.name,
        dogs,
        hasWarning: dogs.some(d => !d.destinationId),
        warningTooltip: this.transloco.translate('dogs.warnings.noDestination'),
      };
    });
  });

  readonly destinationGroups = computed((): DogGroup[] =>
    this.dogsPerDestination().map(entry => ({
      key: entry.destination.id,
      label: entry.destination.name,
      icon: 'pi pi-map-marker',
      dogs: entry.dogs,
    }))
  );

  readonly pickupGroups = computed((): DogGroup[] =>
    this.dogsPerPickupLocation().map(entry => ({
      key: entry.destination.id,
      label: entry.destination.name,
      icon: 'pi pi-map-marker',
      dogs: entry.dogs,
    }))
  );

  readonly dogColumns = computed(() => {
    this._lang();
    return buildDogColumns<Dog & { _idx: number }>(
      this.tripDestinations(),
      (key) => this.transloco.translate(key),
    );
  });

  readonly dogTableConfig: TableConfig = {
    selectable: true,
    striped: true,
    trackByField: '_idx',
    emptyMessage: 'No dogs added yet. Use the "Add Dog" button above.',
  };

  readonly dogActions = computed((): TableAction<Dog & { _idx: number }>[] => [
    {
      icon: 'pi pi-pencil', tooltip: 'Edit dog', severity: 'secondary',
      action: (row) => this.dialog.openEdit(row._idx, row),
    },
    {
      icon: 'pi pi-trash', tooltip: 'Remove dog', severity: 'danger',
      action: (dog) => this.deleteDog(dog),
    },
  ]);

  private isEdit = false;
  private editId: string | null = null;

  init(isEdit: boolean, editId: string | null): void {
    this.isEdit = isEdit;
    this.editId = editId;
  }

  initFromTrip(trip: Trip): void {
    this.init(true, trip.id);
    this.tripDestinations.set(trip.destinations ?? []);
    this.tripPickupLocations.set(trip.pickupLocations ?? []);
    this.setDogs(trip.dogs ?? [], trip.requesters ?? []);
  }

  deleteDog(dog: Dog & { _idx: number }): void {
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

  setDogs(dogs: Dog[], requestors: TripRequester[]): void {
    this.dogsArray.clear();
    dogs.forEach(dog => this.dogsArray.push(this.dogGroup(dog)));
    this.tripRequestors.set(requestors);
    this.clearGroupSelections();
  }

  dogGroup(dog?: Partial<Dog>): FormGroup {
    return this.fb.group({
      id:             [dog?.id             ?? ''],
      name:           [dog?.name           ?? ''],
      size:           [dog?.size           ?? ''],
      gender:         [dog?.gender         ?? ''],
      age:            [dog?.age            ??  1],
      chipId:         [dog?.chipId         ?? ''],
      pickupLocation:   [dog?.pickupLocation   ?? ''],
      pickupLocationId: [dog?.pickupLocationId ?? null],
      dropLocation:     [dog?.dropLocation     ?? ''],
      notes:          [dog?.notes          ?? ''],
      requesterName:  [dog?.requesterName  ?? ''],
      requestId:      [dog?.requestId      ?? null],
      photoUrl:         [dog?.photoUrl         ?? null],
      documentUrl:      [dog?.documentUrl      ?? null],
      destinationId: [dog?.destinationId ?? null],
      receiver:      [dog?.receiver      ?? null],
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
    if (this.editId) {
      const payload = dogs.map(({ id: _id, ...rest }) => rest);
      if (payload.length === 1) {
        this.store.dispatch(addDog({ tripId: this.editId, dog: payload[0] }));
      } else {
        this.store.dispatch(addDogs({ tripId: this.editId, dogs: payload }));
      }
    } else {
      dogs.forEach(dog => this.dogsArray.push(this.dogGroup(dog)));
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

  private selectionsByGroup = new Map<string, (Dog & { _idx: number })[]>();

  onSelectionChange(dogs: (Dog & { _idx: number })[], groupKey?: string): void {
    if (groupKey !== undefined) {
      this.selectionsByGroup.set(groupKey, dogs);
      this.selectedDogs.set(Array.from(this.selectionsByGroup.values()).flat());
    } else {
      this.selectedDogs.set(dogs);
      this.selectionsByGroup.clear();
    }
  }

  clearGroupSelections(): void {
    this.selectionsByGroup.clear();
    this.selectedDogs.set([]);
  }

  removeSelectedDogs(): void {
    const toRemove = [...this.selectedDogs()];
    if (!toRemove.length) return;

    const dogIdsToDelete = toRemove.map(dog => dog.id).filter((id): id is string => !!id);
    if (!this.isEdit || !this.editId || !dogIdsToDelete.length) return;

    this.confirm.confirm({
      header:      this.transloco.translate('trips.confirm.removeDogs.header'),
      message:     this.transloco.translate('trips.confirm.removeDogs.message', { count: toRemove.length }),
      acceptLabel: this.transloco.translate('common.remove'),
      severity:    'danger',
      accept: () => {
        this.store.dispatch(deleteDogs({ tripId: this.editId!, dogIds: dogIdsToDelete }));
        this.selectedDogs.set([]);
      },
    });
  }
}
