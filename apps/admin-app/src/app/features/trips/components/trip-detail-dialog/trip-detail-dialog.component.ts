import { Component, ChangeDetectionStrategy, inject, computed, input, output, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { TranslocoService } from '@jsverse/transloco';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TabsModule } from 'primeng/tabs';
import { AccordionModule } from 'primeng/accordion';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TranslocoModule } from '@jsverse/transloco';
import { DogDialogService } from '../../trip-form/dog-dialog.service';
import { DogFormDialogWrapperComponent } from '../dog-form-dialog-wrapper/dog-form-dialog-wrapper.component';
import { Trip } from '@models/lib/trip.model';
import { Dog } from '@models/lib/dog.model';
import { TripRequest } from '@models/lib/trip-request.model';
import { TableConfig } from '@models/lib/table-column.interface';

import { EmptyStateComponent } from '@ui/lib/components/empty-state/empty-state.component';
import { TripManifestExportService } from '../../../../services/trip-manifest-export.service';
import { DogDetailDialogComponent } from '../dog-detail-dialog/dog-detail-dialog.component';
import { DogsTableComponent } from '../dogs-table.component';
import { DogsByRequestorComponent } from '../dogs-by-requestor/dogs-by-requestor.component';
import { buildDogColumns } from '../../shared/dog-columns';
import { DogManagerService } from '../../trip-form/dog-manager.service';

@Component({
  selector: 'app-trip-detail-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DogDialogService, DogManagerService],
  imports: [
    DialogModule,
    ButtonModule,
    TagModule,
    TabsModule,
    AccordionModule,
    TooltipModule,
    ConfirmDialogModule,
    DogsTableComponent,
    DogsByRequestorComponent,
    EmptyStateComponent,
    TranslocoModule,
    DogDetailDialogComponent,
    DogFormDialogWrapperComponent,
  ],
  templateUrl: './trip-detail-dialog.component.html',
  styleUrls: ['./trip-detail-dialog.component.scss'],
})
export class TripDetailDialogComponent {
  private readonly exportService = inject(TripManifestExportService);
  private readonly transloco = inject(TranslocoService);
  private readonly langChange = toSignal(this.transloco.selectTranslation(), { initialValue: null });
  readonly dogManager = inject(DogManagerService);

  readonly visible = input(false);
  readonly header = input('');
  readonly trip = input<Trip | null>(null);
  readonly requests = input<TripRequest[]>([]);
  readonly activeTab = input('dogs');
  readonly visibleChange = output<boolean>();
  readonly tabChanged = output<string>();
  readonly approveRequest = output<TripRequest>();
  readonly rejectRequest = output<TripRequest>();
  readonly deleteRequest = output<TripRequest>();
  readonly closed = output<void>();

  readonly selectedDog = signal<Dog | null>(null);
  readonly dogDetailVisible = signal(false);

  readonly tableConfig: TableConfig = {
    paginator: false,
    striped: true,
    trackByField: 'id',
  };

  readonly indexedDogs = computed(() =>
    (this.trip()?.dogs ?? []).map((d, i) => ({ ...d, _idx: i }))
  );

  readonly dogColumns = computed(() => { this.langChange(); return buildDogColumns<Dog & { _idx: number }>(); });

  constructor() {
    // toObservable must be called in injection context (constructor/field init, not ngOnInit)
    toObservable(this.trip)
      .pipe(takeUntilDestroyed())
      .subscribe(trip => {
        if (trip) this.dogManager.initFromTrip(trip);
      });
  }

  /** Maps a requester's dog list to global _idx values so edit/delete actions target the right entry. */
  indexDogs(dogs: Dog[]): (Dog & { _idx: number })[] {
    const allDogs = this.trip()?.dogs ?? [];
    return dogs.map(dog => {
      const globalIdx = allDogs.findIndex(allDog => allDog.id === dog.id);
      return { ...dog, _idx: globalIdx >= 0 ? globalIdx : 0 };
    });
  }

  openDogDetail(dog: Dog): void {
    this.selectedDog.set(dog);
    this.dogDetailVisible.set(true);
  }

  getRequest(requestId: string | null): TripRequest | null {
    if (!requestId) return null;
    return this.requests().find((request) => request.id === requestId) ?? null;
  }

  hasDogsWithoutDocuments(request: TripRequest): boolean {
    return request.dogs?.some((dog) => !dog.documentUrl) ?? false;
  }

  onExportPdf(): void {
    const trip = this.trip();
    if (trip) {
      this.exportService.exportTripManifestPdf(trip);
    }
  }

  onHide(): void {
    this.visibleChange.emit(false);
    this.closed.emit();
  }

}
