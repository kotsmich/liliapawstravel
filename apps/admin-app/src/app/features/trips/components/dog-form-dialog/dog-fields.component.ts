import { Component, ChangeDetectionStrategy, inject, computed, input, output } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { IftaLabelModule } from 'primeng/iftalabel';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { toSignal } from '@angular/core/rxjs-interop';
import { TripDestination, TripRequester } from '@models/lib/trip.model';
import { FormFieldComponent } from '@admin/shared/components/form-field/form-field.component';
import { DogRequestorSelectorComponent } from './dog-requestor-selector/dog-requestor-selector.component';
import { DogDocumentsUploaderComponent } from './dog-documents-uploader/dog-documents-uploader.component';

@Component({
  selector: 'app-dog-fields',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    InputNumberModule, InputTextModule, SelectModule, IftaLabelModule, TextareaModule,
    TooltipModule, TranslocoModule,
    FormFieldComponent,
    DogRequestorSelectorComponent,
    DogDocumentsUploaderComponent,
  ],
  templateUrl: './dog-fields.component.html',
  styleUrl: './dog-fields.component.scss',
})
export class DogFieldsComponent {
  readonly form = input.required<FormGroup>();
  readonly idx = input<string | number>(0);
  readonly existingPhotoUrl = input<string | null>(null);
  readonly existingDocumentUrl = input<string | null>(null);
  readonly requestors = input<TripRequester[]>([]);
  readonly tripDestinations = input<TripDestination[]>([]);
  readonly tripPickupLocations = input<TripDestination[]>([]);

  readonly photoFileChange = output<File | null>();
  readonly documentFileChange = output<File | null>();

  private readonly transloco = inject(TranslocoService);
  private readonly langChange = toSignal(this.transloco.selectTranslation(), { initialValue: null });

  readonly PICKUP_OTHER_ID = '__other__';

  readonly pickupOptions = computed((): { id: string | null; name: string }[] => {
    this.langChange();
    return [
      ...this.tripPickupLocations().map(d => ({ id: d.id ?? null, name: d.name })),
      { id: null, name: this.transloco.translate('dogs.fields.pickupOther') },
    ];
  });

  onPickupSelect(id: string | null): void {
    const fg = this.form();
    if (id === null) {
      fg.get('pickupLocation')?.setValue('Other', { emitEvent: false });
      fg.get('pickupLocationId')?.setValue(null, { emitEvent: false });
    } else {
      const dest = this.tripPickupLocations().find(d => d.id === id);
      fg.get('pickupLocation')?.setValue(dest?.name ?? '', { emitEvent: false });
    }
  }

  public sizes = [
      { value: 'small',  label: this.transloco.translate('dogs.fields.sizeSmall') },
      { value: 'medium', label: this.transloco.translate('dogs.fields.sizeMedium') },
      { value: 'large',  label: this.transloco.translate('dogs.fields.sizeLarge') },
    ];

      public genders = [
      { value: 'male',   label: this.transloco.translate('dogs.fields.genderMale') },
      { value: 'female', label: this.transloco.translate('dogs.fields.genderFemale') },
    ];
}
