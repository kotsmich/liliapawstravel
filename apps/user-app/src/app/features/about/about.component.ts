import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { CtaSectionComponent } from '@user/features/home/components/cta-section/cta-section.component';
import { FaqAccordionComponent, FaqItem } from '@user/shared/components/faq-accordion/faq-accordion.component';
import { autoRotate } from '@user/shared/auto-rotate';
import { LinkService } from '@user/services/link.service';

@Component({
  selector: 'app-about',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule, CtaSectionComponent, NgOptimizedImage, FaqAccordionComponent],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent {
  private readonly router = inject(Router);
  private readonly linkService = inject(LinkService);

  readonly heroSlides = [
    'assets/images/about-hero-1.webp',
    'assets/images/about-hero-2.webp',
    'assets/images/about-hero-3.webp',
    'assets/images/about-hero-4.webp',
  ];

  readonly storyPhotos = [
    'assets/images/story-1.webp',
    'assets/images/story-2.webp',
    'assets/images/story-3.webp',
    'assets/images/story-4.webp',
    'assets/images/story-5.webp',
  ];

  readonly values = [
    { icon: '🛡️', titleKey: 'aboutPage.values.safety.title', descKey: 'aboutPage.values.safety.desc' },
    { icon: '🐾', titleKey: 'aboutPage.values.care.title',   descKey: 'aboutPage.values.care.desc'   },
    { icon: '📋', titleKey: 'aboutPage.values.legal.title',  descKey: 'aboutPage.values.legal.desc'  },
    { icon: '🏠', titleKey: 'aboutPage.values.shelter.title', descKey: 'aboutPage.values.shelter.desc' },
    { icon: '🚐', titleKey: 'aboutPage.values.vehicle.title', descKey: 'aboutPage.values.vehicle.desc' },
    { icon: '🌍', titleKey: 'aboutPage.values.reach.title',  descKey: 'aboutPage.values.reach.desc'  },
  ];

  readonly faqItems: FaqItem[] = Array.from({ length: 12 }, (_, i) => ({
    questionKey: `faq.items.${i}.question`,
    answerKey: `faq.items.${i}.answer`,
    value: i.toString(),
  }));

  readonly currentSlide = autoRotate(() => this.heroSlides.length, 3500).index;

  goToRequest(): void { this.router.navigate(this.linkService.commands('/request')); }
  goToContact(): void { this.router.navigate(this.linkService.commands('/contact')); }
}
