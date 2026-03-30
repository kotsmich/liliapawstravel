import { Component, Input, Output, EventEmitter, OnChanges, ChangeDetectionStrategy } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { Dog } from '@models/lib/dog.model';

@Component({
  selector: 'app-dog-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, DialogModule, ButtonModule, InputTextModule, InputNumberModule, SelectModule],
  templateUrl: './dog-form-dialog.component.html',
  styleUrls: ['./dog-form-dialog.component.scss'],
})
export class DogFormDialogComponent implements OnChanges {
  @Input() visible = false;
  @Input() dog: Dog | null = null;
  @Input() tripId = '';
  @Output() save = new EventEmitter<Dog>();
  @Output() cancel = new EventEmitter<void>();
  @Output() visibleChange = new EventEmitter<boolean>();

  editValues: Dog | null = null;

  dogSizes = [
    { label: 'Small (< 10 kg)', value: 'small' },
    { label: 'Medium (10–25 kg)', value: 'medium' },
    { label: 'Large (> 25 kg)', value: 'large' },
  ];

  ngOnChanges(): void {
    if (this.dog) {
      this.editValues = { ...this.dog };
    }
  }

  onSave(): void {
    if (!this.editValues) return;
    this.save.emit(this.editValues);
  }

  onCancel(): void {
    this.cancel.emit();
    this.visibleChange.emit(false);
  }

  onHide(): void {
    this.visibleChange.emit(false);
  }
}
