import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormArray } from '@angular/forms';
import { TranslocoService } from '@jsverse/transloco';
import { Dog } from '@models/lib/dog.model';
import { TripDestination, TripRequester } from '@models/lib/trip.model';
import { TableAction, TableConfig } from '@models/lib/table-column.interface';
import { buildDogColumns } from '@admin/features/trips/shared/dog-columns';
import { DogGroup } from '@admin/features/trips/shared/dog-group.model';
import { DogRequester } from '@admin/features/trips/shared/dog-requester.model';
import { groupBy } from '@admin/shared/utils/group-by';
import { DogDialogService } from './dog-dialog.service';
import { DogActionsService } from './dog-actions.service';

type IndexedDog = Dog & { _idx: number; _destinationName: string };

/**
 * Owns trip context (destinations, pickup locations, requestors) plus all
 * derived view state needed by the dogs tabs: dogsData, the three group
 * computeds, columns, actions, and table config. Pure read-side — no NgRx
 * dispatches or HTTP. The dogs FormArray is supplied via attach() by
 * DogManagerService.
 */
@Injectable()
export class DogGroupingService {
  private readonly transloco = inject(TranslocoService);
  private readonly dialog = inject(DogDialogService);
  private readonly actions = inject(DogActionsService);
  private readonly destroyRef = inject(DestroyRef);

  readonly tripDestinations = signal<TripDestination[]>([]);
  readonly tripPickupLocations = signal<TripDestination[]>([]);
  readonly tripRequestors = signal<TripRequester[]>([]);

  private readonly _lang = toSignal(this.transloco.selectTranslation(), { initialValue: null });
  private readonly _dogsValue = signal<Dog[]>([]);

  readonly dogsData = computed((): IndexedDog[] => this._dogsValue().map((v, i) => ({
    ...v,
    _idx: i,
    _destinationName: this.tripDestinations().find(d => d.id === v.destinationId)?.name ?? '',
  })));

  private readonly dogsByRequester = computed(() => groupBy(this.dogsData(), d => d.requesterId ?? null));
  private readonly dogsByDestination = computed(() => groupBy(this.dogsData(), d => d.destinationId ?? null));
  private readonly dogsByPickup = computed(() => groupBy(this.dogsData(), d => d.pickupLocationId ?? null));

  readonly requestorGroups = computed((): DogGroup[] => {
    this._lang();
    return this.tripRequestors().map(req => {
      const dogs = this.dogsByRequester().get(req.requesterId) ?? [];
      return {
        key: req.requesterId,
        label: req.name,
        dogs,
        hasWarning: dogs.some(d => !d.destinationId),
        warningTooltip: this.transloco.translate('dogs.warnings.noDestination'),
      };
    });
  });

  readonly destinationGroups = computed((): DogGroup[] =>
    this.tripDestinations().map(dest => ({
      key: dest.id || dest.name,
      label: dest.name,
      icon: 'pi pi-map-marker',
      dogs: this.dogsByDestination().get(dest.id ?? null) ?? [],
    })),
  );

  readonly pickupGroups = computed((): DogGroup[] => {
    const grouped = this.dogsByPickup();
    const groups: DogGroup[] = this.tripPickupLocations().map(dest => ({
      key: dest.id || dest.name,
      label: dest.name,
      icon: 'pi pi-map-marker',
      dogs: grouped.get(dest.id ?? null) ?? [],
    }));
    const otherDogs = grouped.get(null) ?? [];
    if (otherDogs.length > 0) {
      groups.push({ key: '__other__', label: 'Other', icon: 'pi pi-map-marker', dogs: otherDogs });
    }
    return groups;
  });

  readonly dogColumns = computed(() => {
    this._lang();
    return buildDogColumns<Dog & { _idx: number }>(
      this.tripDestinations(),
      (key) => this.transloco.translate(key),
      this.tripRequestors(),
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
      action: (dog) => this.actions.deleteDog(dog),
    },
  ]);

  attach(dogsArray: FormArray): void {
    dogsArray.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((values: Dog[]) => this._dogsValue.set(values));
    this._dogsValue.set(dogsArray.value as Dog[]);
  }

  getRequesterForDog(dog: Dog): DogRequester | null {
    const requester = this.tripRequestors().find(r => r.requesterId === dog.requesterId);
    return requester ? { name: requester.name, email: requester.email ?? '', phone: requester.phone ?? '' } : null;
  }
}
