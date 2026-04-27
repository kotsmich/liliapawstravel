import { Directive, Input, inject } from '@angular/core';
import { Button } from 'primeng/button';

@Directive({
  selector: 'p-button[appAsyncButton]',
  standalone: true,
})
export class AsyncButtonDirective {
  private readonly button = inject(Button);

  private loading = false;
  private invalid = false;

  @Input({ required: true })
  set asyncLoading(value: boolean) {
    this.loading = value;
    this.sync();
  }

  @Input()
  set asyncInvalid(value: boolean) {
    this.invalid = value;
    this.sync();
  }

  private sync(): void {
    this.button.loading = this.loading;
    this.button.disabled = this.loading || this.invalid;
  }
}
