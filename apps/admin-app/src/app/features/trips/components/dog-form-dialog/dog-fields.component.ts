import { Component, Input, ChangeDetectionStrategy, OnInit, inject, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { IftaLabelModule } from 'primeng/iftalabel';
import { TextareaModule } from 'primeng/textarea';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TripRequester } from '@models/lib/trip.model';

@Component({
  selector: 'app-dog-fields',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, InputTextModule, InputNumberModule, SelectModule, IftaLabelModule, TextareaModule, TranslocoModule],
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
export class DogFieldsComponent implements OnInit {
  @Input() form!: FormGroup;
  @Input() idx: string | number = 0;
  @Input() requestors: TripRequester[] = [];

  private transloco = inject(TranslocoService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  sizes: { value: string; label: string }[] = [];

  ngOnInit(): void {
    this.transloco.selectTranslation().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.sizes = [
        { value: 'small',  label: this.transloco.translate('dogs.fields.sizeSmall') },
        { value: 'medium', label: this.transloco.translate('dogs.fields.sizeMedium') },
        { value: 'large',  label: this.transloco.translate('dogs.fields.sizeLarge') },
      ];
      this.cdr.markForCheck();
    });
  }

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
