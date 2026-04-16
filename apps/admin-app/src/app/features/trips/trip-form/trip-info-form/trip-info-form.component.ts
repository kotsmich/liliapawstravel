import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { IftaLabelModule } from 'primeng/iftalabel';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { AccordionModule } from 'primeng/accordion';
import { TranslocoModule } from '@jsverse/transloco';
import { FormFieldComponent } from '@admin/shared/components/form-field/form-field.component';
import { TripStatusChecksComponent } from '../trip-status-checks/trip-status-checks.component';

/**
 * Accordion panel with trip metadata fields extracted from trip-form.component.html (lines 22–126).
 * Uses [formGroup] binding so its formControlName directives and FormFieldComponent children
 * all bind to the provided group.
 */
@Component({
  selector: 'app-trip-info-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    InputNumberModule, SelectModule, IftaLabelModule, TextareaModule, DatePickerModule,
    AccordionModule,
    TranslocoModule,
    FormFieldComponent,
    TripStatusChecksComponent,
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
}
