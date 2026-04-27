import { Directive, input, output } from '@angular/core';

/**
 * Shared `visible` / `visibleChange` / `closed` triplet for PrimeNG `<p-dialog>` wrappers.
 * Subclasses inherit these signal IO declarations and can call `onHide()` from `(onHide)`.
 */
@Directive()
export abstract class DetailDialogBase {
  readonly visible = input(false);
  readonly visibleChange = output<boolean>();
  readonly closed = output<void>();

  onHide(): void {
    this.visibleChange.emit(false);
    this.closed.emit();
  }
}
