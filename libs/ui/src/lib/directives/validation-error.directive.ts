import { Directive, DoCheck, Input, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Directive({
  selector: '[appValidationError]',
  standalone: true,
})
export class ValidationErrorDirective implements DoCheck {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);

  private control: AbstractControl | null = null;
  private hasView = false;

  @Input() set appValidationError(control: AbstractControl | null | undefined) {
    this.control = control ?? null;
  }

  ngDoCheck(): void {
    const show = !!this.control?.touched && !!this.control?.invalid;
    if (show && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!show && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
