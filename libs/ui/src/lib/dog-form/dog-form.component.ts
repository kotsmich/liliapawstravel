import { Component, Input, Output, EventEmitter, inject, computed } from '@angular/core';

import { ReactiveFormsModule, FormGroup, AbstractControl } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ui-dog-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    ButtonModule,
    TooltipModule,
    TranslocoModule,
  ],
  templateUrl: './dog-form.component.html',
  styleUrls: ['./dog-form.component.scss'],
})
export class DogFormComponent {
  @Input() formGroup!: FormGroup;
  @Input() index!: number;
  @Input() canRemove = false;
  @Output() removeClicked = new EventEmitter<void>();

  private readonly transloco = inject(TranslocoService);
  private readonly _t = toSignal(this.transloco.selectTranslation(), { initialValue: null });

  readonly sizes = computed((): { value: string; label: string }[] => {
    this._t();
    return [
      { value: 'small',  label: this.transloco.translate('dogs.sizeSmall') },
      { value: 'medium', label: this.transloco.translate('dogs.sizeMedium') },
      { value: 'large',  label: this.transloco.translate('dogs.sizeLarge') },
    ];
  });

  readonly genders = computed((): { value: string; label: string }[] => {
    this._t();
    return [
      { value: 'male',   label: this.transloco.translate('dogs.genderMale') },
      { value: 'female', label: this.transloco.translate('dogs.genderFemale') },
    ];
  });

  ctrl(field: string): AbstractControl {
    return this.formGroup.get(field)!;
  }

  errorFor(field: string): string {
    const c = this.ctrl(field);
    if (!c.errors || !c.touched) return '';
    if (c.errors['required']) return 'Required.';
    if (c.errors['min']) return 'Must be 0 or greater.';
    if (c.errors['minlength']) return `Min ${c.errors['minlength'].requiredLength} chars.`;
    if (c.errors['pattern']) return field === 'chipId' ? '15-digit chip ID.' : 'Invalid format.';
    return '';
  }
}
