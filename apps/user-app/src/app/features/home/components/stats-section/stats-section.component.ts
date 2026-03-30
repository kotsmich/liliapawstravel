import { Component, Input, ChangeDetectionStrategy } from '@angular/core';


@Component({
  selector: 'app-stats-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <section class="stats">
      <div class="container">
        <div class="stats__grid">
          @for (s of stats; track s) {
            <div class="stat flex flex-column gap-2">
              <span class="stat__value">{{ s.value }}</span>
              <span class="stat__label">{{ s.label }}</span>
            </div>
          }
        </div>
      </div>
    </section>
    `,
  styles: [],
})
export class StatsSectionComponent {
  @Input() stats: Array<{ value: string; label: string }> = [];
}
