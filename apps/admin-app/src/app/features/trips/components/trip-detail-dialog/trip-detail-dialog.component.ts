import { Component, ChangeDetectionStrategy, inject, Input, input, output, signal } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { DogDialogService } from '../../trip-form/dog-dialog.service';
import { Trip } from '@models/lib/trip.model';
import { Dog } from '@models/lib/dog.model';
import { TripRequest } from '@models/lib/trip-request.model';
import { TripManifestExportService } from '../../../../services/trip-manifest-export.service';
import { DogDetailDialogComponent } from '../dog-detail-dialog/dog-detail-dialog.component';
import { DogManagerService } from '../../trip-form/dog-manager.service';
import { TripDogsTabsComponent } from '../trip-dogs-tabs/trip-dogs-tabs.component';

@Component({
  selector: 'app-trip-detail-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DogDialogService, DogManagerService],
  imports: [
    DialogModule,
    DogDetailDialogComponent,
    TripDogsTabsComponent,
  ],
  templateUrl: './trip-detail-dialog.component.html',
  styleUrls: ['./trip-detail-dialog.component.scss'],
})
export class TripDetailDialogComponent {
  private readonly exportService = inject(TripManifestExportService);
  readonly dogManager = inject(DogManagerService);

  readonly visible = input(false);
  readonly header = input('');
  readonly trip = signal<Trip | null>(null);

  @Input('trip') set tripInput(value: Trip | null) {
    this.trip.set(value);
    if (value) this.dogManager.initFromTrip(value);
  }
  readonly requests = input<TripRequest[]>([]);
  readonly activeTab = input('all');
  readonly visibleChange = output<boolean>();
  readonly tabChanged = output<string>();
  readonly approveRequest = output<TripRequest>();
  readonly rejectRequest = output<TripRequest>();
  readonly deleteRequest = output<TripRequest>();
  readonly closed = output<void>();

  readonly selectedDog = signal<Dog | null>(null);
  readonly dogDetailVisible = signal(false);

  openDogDetail(dog: Dog): void {
    this.selectedDog.set(dog);
    this.dogDetailVisible.set(true);
  }

  onExportPdf(): void {
    const trip = this.trip();
    if (trip) this.exportService.exportTripManifestPdf(trip);
  }

  onHide(): void {
    this.visibleChange.emit(false);
    this.closed.emit();
  }
}
