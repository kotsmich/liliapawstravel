import { Injectable, inject, signal } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';
import { Dog } from '@models/lib/dog.model';
import { Trip, TripRequester } from '@models/lib/trip.model';
import { DogDialogService } from './dog-dialog.service';
import { DogActionsService } from './dog-actions.service';
import { DogGroupingService } from './dog-grouping.service';
import { DogSelectionStore } from './dog-selection.store';
import { dogGroup } from './dog-form.factory';

/**
 * Thin orchestrator over the four dog feature services. Owns the shared
 * dogs FormArray and currentTrip signal, and re-exposes the API that
 * trip-form / trip-detail-dialog templates and the dog-form-dialog wrapper
 * already consume so callers don't need to reach into individual services.
 */
@Injectable()
export class DogManagerService {
  private readonly fb = inject(FormBuilder);

  readonly dialog = inject(DogDialogService);
  readonly grouping = inject(DogGroupingService);
  readonly actions = inject(DogActionsService);
  readonly selection = inject(DogSelectionStore);

  readonly dogsArray: FormArray = this.fb.array([]);
  readonly currentTrip = signal<Trip | null>(null);

  readonly requesterForm = this.actions.requesterForm;
  readonly topLevelRequester = this.actions.topLevelRequester;

  readonly tripDestinations = this.grouping.tripDestinations;
  readonly tripPickupLocations = this.grouping.tripPickupLocations;
  readonly tripRequestors = this.grouping.tripRequestors;

  readonly selectedDogs = this.selection.selectedDogs;

  readonly dogsData = this.grouping.dogsData;
  readonly requestorGroups = this.grouping.requestorGroups;
  readonly destinationGroups = this.grouping.destinationGroups;
  readonly pickupGroups = this.grouping.pickupGroups;

  readonly dogColumns = this.grouping.dogColumns;
  readonly dogActions = this.grouping.dogActions;
  readonly dogTableConfig = this.grouping.dogTableConfig;

  constructor() {
    this.actions.attach(this.dogsArray);
    this.grouping.attach(this.dogsArray);
  }

  openAdd(): void {
    this.actions.resetRequesterForm();
    this.dialog.openAdd();
  }

  init(isEdit: boolean, editId: string | null): void {
    this.actions.init(isEdit, editId);
  }

  initFromTrip(trip: Trip): void {
    this.currentTrip.set(trip);
    this.actions.init(true, trip.id);
    this.grouping.tripDestinations.set(trip.destinations ?? []);
    this.grouping.tripPickupLocations.set(trip.pickupLocations ?? []);
    this.setDogs(trip.dogs ?? [], trip.requesters ?? []);
  }

  setDogs(dogs: Dog[], requestors: TripRequester[]): void {
    this.dogsArray.clear();
    dogs.forEach(dog => this.dogsArray.push(dogGroup(dog)));
    this.grouping.tripRequestors.set(requestors);
    this.selection.clearGroupSelections();
  }

  onDogSaved(dogs: Dog[]): void {
    this.actions.onDogSaved(dogs);
  }

  deleteDog(dog: Dog & { _idx: number }): void {
    this.actions.deleteDog(dog);
  }

  removeSelectedDogs(): void {
    this.actions.removeSelectedDogs();
  }

  onSelectionChange(dogs: (Dog & { _idx: number })[], groupKey?: string): void {
    this.selection.onSelectionChange(dogs, groupKey);
  }

  clearGroupSelections(): void {
    this.selection.clearGroupSelections();
  }

  getRequesterForDog(dog: Dog) {
    return this.grouping.getRequesterForDog(dog);
  }
}
