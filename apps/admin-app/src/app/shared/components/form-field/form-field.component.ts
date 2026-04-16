import {
  Component, ChangeDetectionStrategy, inject, input, computed,
} from '@angular/core';
import { ControlContainer, ReactiveFormsModule } from '@angular/forms';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputTextModule } from 'primeng/inputtext';
import { TranslocoModule } from '@jsverse/transloco';

/**
 * Shared wrapper for the repeated `div.field > p-ifta-label > input[pInputText] + label + p-error`
 * pattern. Picks up the parent FormGroup automatically via ControlContainer injection —
 * no [formGroup] binding is needed in the parent template.
 */
@Component({
  selector: 'app-form-field',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    { provide: ControlContainer, useFactory: () => inject(ControlContainer, { skipSelf: true }) },
  ],
  imports: [ReactiveFormsModule, IftaLabelModule, InputTextModule, TranslocoModule],
  template: `
    <div class="field fw">
      <p-ifta-label>
        <input
          pInputText
          [id]="fieldId()"
          [formControlName]="controlName()"
          [type]="type()"
          [attr.maxlength]="maxlength() ?? null"
          [attr.placeholder]="placeholder() ?? null"
          class="w-full" />
        <label [for]="fieldId()">{{ labelKey() | transloco }}</label>
      </p-ifta-label>
      @if (control()?.touched && control()?.invalid) {
        <small class="p-error">{{ errorKey() | transloco }}</small>
      }
    </div>
  `,
  styles: [`:host { display: contents; }
    .field { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 0.75rem; }
    .fw { width: 100%; }
    .p-error { font-size: 0.75rem; color: var(--color-error-alt); }`],
})
export class FormFieldComponent {
  readonly controlName = input.required<string>();
  readonly labelKey = input.required<string>();
  readonly errorKey = input<string>('');
  readonly type = input<string>('text');
  /** Optional suffix appended to the generated id to prevent duplicate IDs when multiple
   *  instances of the same form appear in the page (e.g. dog forms indexed by position). */
  readonly idSuffix = input<string | number | null>(null);
  readonly maxlength = input<number | null>(null);
  readonly placeholder = input<string | null>(null);

  private readonly cc = inject(ControlContainer);
  readonly control = computed(() => this.cc.control?.get(this.controlName()));
  readonly fieldId = computed(() => {
    const suffix = this.idSuffix();
    return suffix !== null ? `${this.controlName()}-${suffix}` : this.controlName();
  });
}
