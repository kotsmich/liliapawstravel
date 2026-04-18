import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { InputTextModule } from 'primeng/inputtext';
import { TranslocoModule } from '@jsverse/transloco';
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
  readonly items = input.required<TripDestination[]>();
  readonly inputCtrl = input.required<FormControl<string | null>>();
  readonly config = input.required<LocationListConfig>();
  readonly hasError = input<boolean>(false);

  readonly addItem = output<void>();
  readonly removeItem = output<number>();
}
