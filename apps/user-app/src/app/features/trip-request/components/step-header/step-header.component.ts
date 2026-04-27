import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-step-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./step-header.component.scss'],
  template: `
    <div class="step-head">
      <div class="step-num" [class.done]="done()">
        @if (done()) {
          <i class="pi pi-check"></i>
        } @else {
          {{ num() }}
        }
      </div>
      <div>
        <h2><ng-content /></h2>
        @if (sub(); as subText) {
          <p class="step-sub">{{ subText }}</p>
        }
      </div>
    </div>
  `,
})
export class StepHeaderComponent {
  readonly num = input.required<number>();
  readonly done = input<boolean>(false);
  readonly sub = input<string | null>(null);
}
