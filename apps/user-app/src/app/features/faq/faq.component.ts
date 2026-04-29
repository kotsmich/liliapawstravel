import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { CtaSectionComponent } from '@user/features/home/components/cta-section/cta-section.component';
import { FaqAccordionComponent, FaqItem } from '@user/shared/components/faq-accordion/faq-accordion.component';

@Component({
  selector: 'app-faq',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule, CtaSectionComponent, FaqAccordionComponent],
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
})
export class FaqComponent {
  private readonly router = inject(Router);

  readonly faqItems: FaqItem[] = Array.from({ length: 12 }, (_, i) => ({
    questionKey: `faq.items.${i}.question`,
    answerKey: `faq.items.${i}.answer`,
    value: i.toString(),
  }));

  goToRequest(): void { this.router.navigate(['/request']); }
  goToContact(): void { this.router.navigate(['/contact']); }
}
