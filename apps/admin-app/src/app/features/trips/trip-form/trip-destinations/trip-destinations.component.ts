import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { InputTextModule } from 'primeng/inputtext';
import { TranslocoModule } from '@jsverse/transloco';
import { TripDestination } from '@models/lib/trip.model';

@Component({
  selector: 'app-trip-destinations',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ButtonModule, ChipModule, InputTextModule, TranslocoModule],
  templateUrl: './trip-destinations.component.html',
  styleUrl: './trip-destinations.component.scss',
})
export class TripDestinationsComponent {
  readonly destinations = input.required<TripDestination[]>();
  readonly inputCtrl = input.required<FormControl<string | null>>();
  readonly hasError = input<boolean>(false);

  readonly addDestination = output<void>();
  readonly removeDestination = output<number>();
}
