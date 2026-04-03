import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-about-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule],
  templateUrl: './about-section.component.html',
  styleUrls: ['./about-section.component.scss'],
})
export class AboutSectionComponent {
  @Input() values: Array<{ icon: string; title: string; desc: string }> = [];
  @Input() steps: Array<{ step: number; title: string; desc: string }> = [];
}
