import { Component, Input, ChangeDetectionStrategy } from '@angular/core';


@Component({
  selector: 'app-stats-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './stats-section.component.html',
  styleUrls: ['./stats-section.component.scss'],
})
export class StatsSectionComponent {
  @Input() stats: Array<{ value: string; label: string }> = [];
}
