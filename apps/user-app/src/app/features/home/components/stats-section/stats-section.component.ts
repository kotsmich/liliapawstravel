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
  styles: [`
    :host { display: block; }
    .container { max-width:1200px; margin:0 auto; }
    .stats { background:#2d2016; padding:3rem 1.5rem; }
    .stats__grid { display:grid; grid-template-columns:repeat(4,1fr); gap:2rem; text-align:center; }
    @media(max-width:768px){ .stats__grid{grid-template-columns:repeat(2,1fr);} }
    .stat { flex-direction:column; gap:.5rem; }
    .stat__value { font-size:2.5rem; font-weight:800; color:#c47c3e; }
    .stat__label { font-size:.8rem; color:#d4b896; text-transform:uppercase; letter-spacing:.08em; }
  `],
})
export class StatsSectionComponent {
  @Input() stats: Array<{ value: string; label: string }> = [];
}
