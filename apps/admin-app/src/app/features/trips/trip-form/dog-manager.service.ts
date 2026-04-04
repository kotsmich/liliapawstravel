import { Injectable } from '@angular/core';
import { FormBuilder, FormArray, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ConfirmationService } from 'primeng/api';
import { Dog } from '@models/lib/dog.model';
import { TripRequester } from '@models/lib/trip.model';
import { TableColumn, TableAction, TableConfig } from '@models/lib/table-column.interface';
import { addDog, addDogs, updateDog, deleteDog, deleteDogs } from '@admin/features/trips/store';

@Injectable()
export class DogManagerService {
  readonly dogsArray: FormArray;

  // Dialog state
  dialogVisible = false;
  selectedDog: Dog | null = null;
  editingIndex: number | null = null;

  // Table data (refreshed on every dogs change)
  dogsData: (Dog & { _idx: number })[] = [];
  dogsPerRequestor: Map<string, (Dog & { _idx: number })[]> = new Map();
  selectedDogs: (Dog & { _idx: number })[] = [];
  tripRequestors: TripRequester[] = [];

  readonly dogColumns: TableColumn<Dog & { _idx: number }>[] = [
    { field: 'name', header: 'Name', sortable: true },
    {
      field: 'size', header: 'Size', type: 'badge',
      badgeConfig: {
        severity: (v) => v === 'small' ? 'success' : v === 'medium' ? 'warn' : 'danger',
        label: (v) => String(v ?? ''),
      },
    },
    { field: 'age', header: 'Age', formatter: (v) => v != null ? `${v} yr` : '—' },
    { field: 'pickupLocation', header: 'Pickup' },
    { field: 'dropLocation', header: 'Drop' },
    { field: 'chipId', header: 'Chip ID' },
    { field: 'requesterName', header: 'Requester', formatter: (v) => String(v ?? '—') },
  ];

  readonly dogTableConfig: TableConfig = {
    selectable: true,
    striped: true,
    trackByField: '_idx',
    emptyMessage: 'No dogs added yet. Use the "Add Dog" button above.',
  };

  dogActions: TableAction<Dog & { _idx: number }>[] = [
    { icon: 'pi pi-pencil', tooltip: 'Edit dog', severity: 'secondary', action: (row) => this.openEditDialog(row._idx) },
  ];

  private isEdit = false;
  private editId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private confirmationService: ConfirmationService,
  ) {
    this.dogsArray = this.fb.array([]);
  }

  /** Call once in ngOnInit after edit context is known. */
  init(isEdit: boolean, editId: string | null): void {
    this.isEdit = isEdit;
    this.editId = editId;
  }

  /** Replace all dogs in the array and refresh derived table data. */
  setDogs(dogs: Dog[], requestors: TripRequester[]): void {
    this.dogsArray.clear();
    dogs.forEach(d => this.dogsArray.push(this.dogGroup(d)));
    this.tripRequestors = requestors;
    this.refreshDogsData();
  }

  dogGroup(dog?: Partial<Dog>): FormGroup {
    return this.fb.group({
      id:             [dog?.id             ?? ''],
      name:           [dog?.name           ?? ''],
      size:           [dog?.size           ?? ''],
      age:            [dog?.age            ??  1],
      chipId:         [dog?.chipId         ?? ''],
      pickupLocation: [dog?.pickupLocation ?? ''],
      dropLocation:   [dog?.dropLocation   ?? ''],
      notes:          [dog?.notes          ?? ''],
      requesterName:  [dog?.requesterName  ?? ''],
      requestId:      [dog?.requestId      ?? null],
    });
  }

  refreshDogsData(): void {
    this.dogsData = this.dogsArray.controls.map((ctrl, i) => ({ ...ctrl.value, _idx: i }));
    const map = new Map<string, (Dog & { _idx: number })[]>();
    this.tripRequestors.forEach(req => {
      map.set(req.requestId ?? req.name, this.dogsData.filter(d => req.dogs.some(rd => rd.id === d.id)));
    });
    this.dogsPerRequestor = map;
  }

  openAddDialog(): void {
    this.selectedDog = null;
    this.editingIndex = null;
    this.dialogVisible = true;
  }

  openEditDialog(index: number): void {
    this.selectedDog = { ...this.dogsArray.at(index).value } as Dog;
    this.editingIndex = index;
    this.dialogVisible = true;
  }

  onDogSaved(dogs: Dog[]): void {
    if (this.editingIndex !== null) {
      const dog = dogs[0];
      if (this.isEdit && this.editId && dog.id) {
        this.store.dispatch(updateDog({ tripId: this.editId, dog }));
      }
      (this.dogsArray.at(this.editingIndex) as FormGroup).patchValue(dog);
      this.refreshDogsData();
    } else {
      if (this.editId) {
        const payload = dogs.map(({ id: _id, ...rest }) => rest);
        if (payload.length === 1) {
          this.store.dispatch(addDog({ tripId: this.editId, dog: payload[0] }));
        } else {
          this.store.dispatch(addDogs({ tripId: this.editId, dogs: payload }));
        }
      } else {
        dogs.forEach(dog => this.dogsArray.push(this.dogGroup(dog)));
        this.refreshDogsData();
      }
    }
    this.dialogVisible = false;
    this.selectedDog = null;
    this.editingIndex = null;
  }

  onDogDialogCancelled(): void {
    this.dialogVisible = false;
    this.selectedDog = null;
    this.editingIndex = null;
  }

  removeDog(i: number, capacity: number, onCapacityUnderflow: () => void): void {
    const dog = this.dogsArray.at(i).value as Dog;
    const doRemove = () => {
      this.dogsArray.removeAt(i);
      if (this.dogsArray.length < capacity) {
        onCapacityUnderflow();
      }
      this.refreshDogsData();
    };
    if (this.isEdit && this.editId && dog.id) {
      this.confirmationService.confirm({
        header: 'Remove Dog',
        message: `Remove <strong>${dog.name}</strong> from this trip? This cannot be undone.`,
        acceptLabel: 'Remove',
        rejectLabel: 'Cancel',
        acceptButtonStyleClass: 'p-button-danger',
        accept: () => {
          this.store.dispatch(deleteDog({ tripId: this.editId!, dogId: dog.id }));
          doRemove();
        },
      });
    } else {
      doRemove();
    }
  }

  private selectionsByGroup = new Map<string, (Dog & { _idx: number })[]>();

  onSelectionChange(dogs: (Dog & { _idx: number })[], groupKey?: string): void {
    if (groupKey !== undefined) {
      this.selectionsByGroup.set(groupKey, dogs);
      this.selectedDogs = Array.from(this.selectionsByGroup.values()).flat();
    } else {
      this.selectedDogs = dogs;
      this.selectionsByGroup.clear();
    }
    this.dogActions = [...this.dogActions];
  }

  clearGroupSelections(): void {
    this.selectionsByGroup.clear();
    this.selectedDogs = [];
  }

  removeSelectedDogs(): void {
    const toRemove = [...this.selectedDogs];
    if (!toRemove.length) return;

    const dogIdsToDelete = toRemove.map(d => d.id).filter((id): id is string => !!id);
    if (!this.isEdit || !this.editId || !dogIdsToDelete.length) return;

    this.confirmationService.confirm({
      header: 'Remove Dogs',
      message: `Remove <strong>${toRemove.length}</strong> dog(s) from this trip? This cannot be undone.`,
      acceptLabel: 'Remove',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.store.dispatch(deleteDogs({ tripId: this.editId!, dogIds: dogIdsToDelete }));
        this.selectedDogs = [];
        this.dogActions = [];
      },
    });
  }
}
