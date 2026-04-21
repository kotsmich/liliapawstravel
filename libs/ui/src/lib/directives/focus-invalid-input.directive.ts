import { Directive, ElementRef, HostListener, inject } from '@angular/core';

@Directive({
  selector: '[focusInvalidInput]',
  standalone: true,
})
export class FocusInvalidInputDirective {
  private readonly el = inject(ElementRef);

  @HostListener('submit')
  onFormSubmit(): void {
    setTimeout(() => {
      const invalid = this.el.nativeElement.querySelector(
        'input.ng-invalid, textarea.ng-invalid, p-select.ng-invalid, p-inputnumber.ng-invalid input'
      ) as HTMLElement | null;

      if (invalid) {
        invalid.scrollIntoView({ block: 'center' });
        invalid.focus();
        invalid.click();
      }
    }, 0);
  }
}
