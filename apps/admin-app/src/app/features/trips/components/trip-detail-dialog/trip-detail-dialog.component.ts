import { Component, ChangeDetectionStrategy, inject, Input, input, output, signal } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { DogDialogService } from '../../trip-form/dog-dialog.service';
import { Trip } from '@models/lib/trip.model';
import { Dog } from '@models/lib/dog.model';
import { TripRequest } from '@models/lib/trip-request.model';
import { DetailDialogBase } from '@admin/shared/components/detail-dialog-base';
import { DogDetailDialogComponent } from '../dog-detail-dialog/dog-detail-dialog.component';
import { DogManagerService } from '../../trip-form/dog-manager.service';
import { DogActionsService } from '../../trip-form/dog-actions.service';
import { DogGroupingService } from '../../trip-form/dog-grouping.service';
import { DogSelectionStore } from '../../trip-form/dog-selection.store';
import { TripDogsTabsComponent } from '../trip-dogs-tabs/trip-dogs-tabs.component';
import { LoadingSpinnerComponent } from '@ui/lib/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-trip-detail-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DogDialogService, DogSelectionStore, DogActionsService, DogGroupingService, DogManagerService],
  imports: [
    DialogModule,
    DogDetailDialogComponent,
    TripDogsTabsComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './trip-detail-dialog.component.html',
  styleUrls: ['./trip-detail-dialog.component.scss'],
})
export class TripDetailDialogComponent extends DetailDialogBase {
  readonly dogManager = inject(DogManagerService);

  readonly header = input('');
  readonly loading = input(false);
  readonly trip = signal<Trip | null>(null);

  @Input('trip') set tripInput(value: Trip | null) {
    this.trip.set(value);
    if (value) this.dogManager.initFromTrip(value);
  }
  readonly requests = input<TripRequest[]>([]);
  readonly approveRequest = output<TripRequest>();
  readonly rejectRequest = output<TripRequest>();
  readonly deleteRequest = output<TripRequest>();

  readonly selectedDog = signal<Dog | null>(null);
  readonly dogDetailVisible = signal(false);

  openDogDetail(dog: Dog): void {
    this.selectedDog.set(dog);
    this.dogDetailVisible.set(true);
  }

  readonly selectedRequester = () => {
    const dog = this.selectedDog();
    return dog ? this.dogManager.getRequesterForDog(dog) : null;
  };
}
