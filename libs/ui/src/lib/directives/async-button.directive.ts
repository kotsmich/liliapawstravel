import { Directive, effect, inject, input } from '@angular/core';
import { Button } from 'primeng/button';

@Directive({
  selector: 'p-button[appAsyncButton]',
  standalone: true,
})
export class AsyncButtonDirective {
  private readonly button = inject(Button);

  readonly asyncLoading = input.required<boolean>();
  readonly asyncInvalid = input<boolean>(false);

  constructor() {
    effect(() => {
      const loading = this.asyncLoading();
      this.button.loading = loading;
      this.button.disabled = loading || this.asyncInvalid();
    });
  }
}
