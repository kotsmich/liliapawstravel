import { Component, ChangeDetectionStrategy, inject, input, computed } from '@angular/core';
import { ControlContainer, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { IftaLabelModule } from 'primeng/iftalabel';
import { TranslocoModule } from '@jsverse/transloco';
import { TripRequester } from '@models/lib/trip.model';

/**
 * Conditional requestor-selection block extracted from dog-fields.component.html (lines 77–107).
 * Shows a p-select when existing requestors exist plus a free-text input for a new requester name.
 * Picks up the parent FormGroup via ControlContainer — no [formGroup] binding needed in the parent.
 */
@Component({
  selector: 'app-dog-requestor-selector',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    { provide: ControlContainer, useFactory: () => inject(ControlContainer, { skipSelf: true }) },
  ],
  imports: [ReactiveFormsModule, SelectModule, InputTextModule, IftaLabelModule, TranslocoModule],
  templateUrl: './dog-requestor-selector.component.html',
})
export class DogRequestorSelectorComponent {
  readonly requestors = input<TripRequester[]>([]);
  readonly idx = input<string | number>(0);

  private readonly cc = inject(ControlContainer);
  get form(): FormGroup { return this.cc.control as FormGroup; }

  readonly requestorOptions = computed(() =>
    this.requestors().map((requestor) => ({
      ...requestor,
      _key: requestor.requestId ?? `__m__${requestor.name}`,
    }))
  );

  onRequestorChange(key: string | null): void {
    if (!key) {
      this.form.patchValue({ requestId: null, requesterName: null, requesterKey: null });
    } else {
      const option = this.requestorOptions().find((option) => option._key === key) ?? null;
      this.form.patchValue({
        requestId: option?.requestId ?? null,
        requesterName: option?.name ?? '',
        newRequesterName: null,
        requesterKey: key,
      });
    }
  }

  onNewRequesterNameInput(): void {
    const val = this.form.get('newRequesterName')?.value;
    if (val) {
      this.form.patchValue({ requestId: null, requesterName: null, requesterKey: null });
    }
  }
}
