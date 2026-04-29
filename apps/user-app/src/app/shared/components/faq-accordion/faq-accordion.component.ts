import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { AccordionModule } from 'primeng/accordion';

export interface FaqItem {
  questionKey: string;
  answerKey: string;
  value: string;
}

@Component({
  selector: 'app-faq-accordion',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule, AccordionModule],
  templateUrl: './faq-accordion.component.html',
  styleUrls: ['./faq-accordion.component.scss'],
})
export class FaqAccordionComponent {
  readonly items = input.required<FaqItem[]>();
  readonly titleKey = input<string | null>(null);
  readonly defaultOpen = input<string[]>(['0']);
}
