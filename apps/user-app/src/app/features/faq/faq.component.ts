import { ChangeDetectionStrategy, Component, DestroyRef, OnDestroy, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { map, startWith, switchMap } from 'rxjs';
import { CtaSectionComponent } from '@user/features/home/components/cta-section/cta-section.component';
import { FaqAccordionComponent, FaqItem } from '@user/shared/components/faq-accordion/faq-accordion.component';
import { JsonLdService } from '@user/services/json-ld.service';
import { LinkService } from '@user/services/link.service';

const FAQ_JSONLD_ID = 'faq';

@Component({
  selector: 'app-faq',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule, CtaSectionComponent, FaqAccordionComponent],
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
})
export class FaqComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly linkService = inject(LinkService);
  private readonly transloco = inject(TranslocoService);
  private readonly jsonLd = inject(JsonLdService);
  private readonly destroyRef = inject(DestroyRef);

  readonly faqItems: FaqItem[] = Array.from({ length: 12 }, (_, i) => ({
    questionKey: `faq.items.${i}.question`,
    answerKey: `faq.items.${i}.answer`,
    value: i.toString(),
  }));

  ngOnInit(): void {
    this.transloco.langChanges$
      .pipe(
        startWith(this.transloco.getActiveLang()),
        switchMap((lang) => this.transloco.load(lang).pipe(map(() => lang))),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((lang) => this.publishFaqSchema(lang));
  }

  ngOnDestroy(): void {
    this.jsonLd.clear(FAQ_JSONLD_ID);
  }

  goToRequest(): void { this.router.navigate(this.linkService.commands('/request')); }
  goToContact(): void { this.router.navigate(this.linkService.commands('/contact')); }

  private publishFaqSchema(lang: string): void {
    const mainEntity = this.faqItems.map((item) => ({
      '@type': 'Question',
      name: this.transloco.translate(item.questionKey, undefined, lang),
      acceptedAnswer: {
        '@type': 'Answer',
        text: stripHtml(this.transloco.translate(item.answerKey, undefined, lang)),
      },
    }));
    this.jsonLd.set(FAQ_JSONLD_ID, {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity,
    });
  }
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}
