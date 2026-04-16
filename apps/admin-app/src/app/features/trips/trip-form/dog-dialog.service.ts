import { Injectable, signal } from '@angular/core';
import { Dog } from '@models/lib/dog.model';

/**
 * Owns the dog form dialog UI state and pending file staging.
 * Provided alongside DogManagerService at the component level.
 */
@Injectable()
export class DogDialogService {
  readonly dialogVisible = signal(false);
  readonly selectedDog = signal<Dog | null>(null);

  /** Index into dogsArray being edited; null in add mode. */
  editingIndex: number | null = null;

  private pendingPhotoFile: File | null = null;
  private pendingDocumentFile: File | null = null;

  setPendingPhotoFile(file: File | null): void { this.pendingPhotoFile = file; }
  setPendingDocumentFile(file: File | null): void { this.pendingDocumentFile = file; }

  /**
   * Returns and clears both pending files so the caller can upload them.
   * Calling this a second time always returns nulls.
   */
  takePendingFiles(): { photo: File | null; document: File | null } {
    const result = { photo: this.pendingPhotoFile, document: this.pendingDocumentFile };
    this.pendingPhotoFile = null;
    this.pendingDocumentFile = null;
    return result;
  }

  openAdd(): void {
    this.selectedDog.set(null);
    this.editingIndex = null;
    this.dialogVisible.set(true);
  }

  openEdit(index: number, dog: Dog): void {
    this.selectedDog.set({ ...dog });
    this.editingIndex = index;
    this.dialogVisible.set(true);
  }

  /** Close after a successful save (files already consumed via takePendingFiles). */
  close(): void {
    this.dialogVisible.set(false);
    this.selectedDog.set(null);
    this.editingIndex = null;
  }

  /** Cancel without saving — also discards any staged files. */
  cancel(): void {
    this.pendingPhotoFile = null;
    this.pendingDocumentFile = null;
    this.close();
  }
}
