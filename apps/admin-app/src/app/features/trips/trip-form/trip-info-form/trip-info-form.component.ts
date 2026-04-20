import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { IftaLabelModule } from 'primeng/iftalabel';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { AccordionModule } from 'primeng/accordion';
import { TabsModule } from 'primeng/tabs';
import { TranslocoModule } from '@jsverse/transloco';
import { FormFieldComponent } from '@admin/shared/components/form-field/form-field.component';
import { ValidationErrorDirective } from '@ui/lib/directives/validation-error.directive';
import { TripStatusChecksComponent } from '../trip-status-checks/trip-status-checks.component';
import { TripLocationListComponent, type LocationListConfig } from '../trip-location-list/trip-location-list.component';
import { TripDestination } from '@models/lib/trip.model';

@Component({
  selector: 'app-trip-info-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    InputNumberModule, SelectModule, IftaLabelModule, TextareaModule, DatePickerModule,
    AccordionModule, TabsModule,
    TranslocoModule,
    FormFieldComponent, ValidationErrorDirective,
    TripStatusChecksComponent,
    TripLocationListComponent,
  ],
  templateUrl: './trip-info-form.component.html',
  styleUrl: './trip-info-form.component.scss',
})
export class TripInfoFormComponent {
  readonly form = input.required<FormGroup>();
  readonly isEdit = input<boolean>(false);
  readonly today = input.required<Date>();
  readonly statuses = input<{ label: string; value: string }[]>([]);
  readonly isAtCapacity = input<boolean>(false);
  readonly capacityWarning = input<string | null>(null);
  readonly dogsCount = input<number>(0);

  readonly pickupLocations = input.required<TripDestination[]>();
  readonly destinations = input.required<TripDestination[]>();
  readonly pickupLocationInputCtrl = input.required<FormControl<string | null>>();
  readonly destinationInputCtrl = input.required<FormControl<string | null>>();
  readonly pickupLocationsConfig = input.required<LocationListConfig>();
  readonly destinationsConfig = input.required<LocationListConfig>();
  readonly pickupLocationsHasError = input<boolean>(false);
  readonly destinationsHasError = input<boolean>(false);

  readonly addPickupLocation = output<void>();
  readonly removePickupLocation = output<number>();
  readonly addDestination = output<void>();
  readonly removeDestination = output<number>();
}
