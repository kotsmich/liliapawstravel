import { Component, ChangeDetectionStrategy, inject, input } from '@angular/core';
import { DogManagerService } from '../../trip-form/dog-manager.service';
import { DogFormDialogComponent } from '../dog-form-dialog/dog-form-dialog.component';

/**
 * Single canonical binding of <app-dog-form-dialog> to DogManagerService / DogDialogService.
 * Both trip-form and trip-detail-dialog include this wrapper instead of copy-pasting the block.
 *
 * Requires DogManagerService (and therefore DogDialogService) to be provided by an ancestor.
 */
@Component({
  selector: 'app-dog-form-dialog-wrapper',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DogFormDialogComponent],
  template: `
    <app-dog-form-dialog
      [visible]="dogManager.dialog.dialogVisible()"
      (visibleChange)="dogManager.dialog.dialogVisible.set($event)"
      [tripId]="tripId()"
      [dog]="dogManager.dialog.selectedDog()"
      [requestors]="dogManager.tripRequestors()"
      (dogSaved)="dogManager.onDogSaved($event)"
      (photoFileChange)="dogManager.dialog.setPendingPhotoFile($event)"
      (documentFileChange)="dogManager.dialog.setPendingDocumentFile($event)"
      (cancelled)="dogManager.dialog.cancel()" />
  `,
})
export class DogFormDialogWrapperComponent {
  readonly dogManager = inject(DogManagerService);
  readonly tripId = input<string | null>(null);
}
