import { Component, ChangeDetectionStrategy, computed, input } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { InputTextModule } from 'primeng/inputtext';
import { TranslocoModule } from '@jsverse/transloco';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { startWith, switchMap } from 'rxjs';
import { TripDestination } from '@models/lib/trip.model';

export interface LocationListConfig {
  titleKey: string;
  hintKey: string;
  placeholderKey: string;
  addButtonKey: string;
  emptyKey: string;
  errorKey: string;
}

@Component({
  selector: 'app-trip-location-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ButtonModule, ChipModule, InputTextModule, TranslocoModule],
  templateUrl: './trip-location-list.component.html',
  styleUrl: './trip-location-list.component.scss',
})
export class TripLocationListComponent {
  readonly control = input.required<FormControl<TripDestination[] | null>>();
  readonly config = input.required<LocationListConfig>();

  readonly inputCtrl = new FormControl('');

  private readonly tick = toSignal(
    toObservable(this.control).pipe(switchMap(c => c.events.pipe(startWith(null)))),
  );

  readonly items = computed(() => {
    this.tick();
    return this.control().value ?? [];
  });
  readonly hasError = computed(() => {
    this.tick();
    const c = this.control();
    return c.touched && c.invalid;
  });

  add(): void {
    const val = (this.inputCtrl.value ?? '').trim();
    if (!val) return;
    const c = this.control();
    c.setValue([...(c.value ?? []), { name: val }]);
    this.inputCtrl.setValue('');
  }

  remove(index: number): void {
    const c = this.control();
    const updated = [...(c.value ?? [])];
    updated.splice(index, 1);
    c.setValue(updated);
    c.markAsTouched();
  }
}
