import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { IftaLabelModule } from 'primeng/iftalabel';
import { TextareaModule } from 'primeng/textarea';
import { TripRequester } from '@models/lib/trip.model';

@Component({
  selector: 'app-dog-fields',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, InputTextModule, InputNumberModule, SelectModule, IftaLabelModule, TextareaModule],
  templateUrl: './dog-fields.component.html',
  styles: [`
    :host { display: block; }
    .dlg-form { display: flex; flex-direction: column; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 0 1rem; }
    @media (max-width: 600px) { .row { grid-template-columns: 1fr; } }
    .field { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 0.75rem; }
    .fw { width: 100%; }
    .p-error { font-size: 0.75rem; color: var(--color-error-alt); }
  `],
})
export class DogFieldsComponent {
  @Input() form!: FormGroup;
  /** Used to generate unique field IDs when multiple instances are on the page. */
  @Input() idx: string | number = 0;
  /** When provided, shows a requestor dropdown instead of a free-text requester field. */
  @Input() requestors: TripRequester[] = [];

  readonly sizes = [
    { value: 'small',  label: 'Small (< 10 kg)' },
    { value: 'medium', label: 'Medium (10–25 kg)' },
    { value: 'large',  label: 'Large (> 25 kg)' },
  ];

  onRequestorChange(requestId: string | null): void {
    const req = this.requestors.find((r) => r.requestId === requestId) ?? null;
    this.form.patchValue({ requesterName: req?.name ?? '', newRequesterName: null });
  }

  onNewRequesterNameInput(): void {
    const val = this.form.get('newRequesterName')?.value;
    if (val) {
      this.form.patchValue({ requestId: null, requesterName: null });
    }
  }
}
