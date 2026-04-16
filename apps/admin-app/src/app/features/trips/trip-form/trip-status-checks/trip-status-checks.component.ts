import { Component, input } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { StatusCheckFieldComponent } from '@admin/shared/components/status-check-field/status-check-field.component';

/**
 * Renders the "Trip Capacity" and "Request Acceptance" status-check rows
 * extracted from trip-form.component.html (formerly lines 118–174).
 * Each row is delegated to StatusCheckFieldComponent.
 */
@Component({
  selector: 'app-trip-status-checks',
  standalone: true,
  imports: [ReactiveFormsModule, StatusCheckFieldComponent],
  templateUrl: './trip-status-checks.component.html',
  styleUrl: './trip-status-checks.component.scss',
})
export class TripStatusChecksComponent {
  readonly form = input.required<FormGroup>();
  readonly isAtCapacity = input.required<boolean>();
  readonly capacityWarning = input<string | null>(null);
  readonly dogsCount = input.required<number>();
}
