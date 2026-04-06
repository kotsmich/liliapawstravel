import {
  Component, ChangeDetectionStrategy, inject,
  OnInit, OnDestroy, ChangeDetectorRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { StatsSectionComponent } from '@user/features/home/components/stats-section/stats-section.component';
import { CtaSectionComponent } from '@user/features/home/components/cta-section/cta-section.component';

@Component({
  selector: 'app-about',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule, StatsSectionComponent, CtaSectionComponent],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly cdr    = inject(ChangeDetectorRef);

  readonly heroSlides = [
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1600&q=80',
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1600&q=80',
    'https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=1600&q=80',
    'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=1600&q=80',
  ];

  currentSlide = 0;
  private slideTimer: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.slideTimer = setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.heroSlides.length;
      this.cdr.markForCheck();
    }, 3500);
  }

  ngOnDestroy(): void {
    if (this.slideTimer) clearInterval(this.slideTimer);
  }

  readonly stats = [
    { value: '1,200+', label: 'stats.dogsTransported' },
    { value: '18',     label: 'stats.countries'       },
    { value: '6',      label: 'stats.yearsActive'     },
    { value: '99%',    label: 'stats.safeArrivals'    },
  ];

  readonly timeline = [
    { year: '2018', titleKey: 'aboutPage.timeline.2018.title', descKey: 'aboutPage.timeline.2018.desc' },
    { year: '2019', titleKey: 'aboutPage.timeline.2019.title', descKey: 'aboutPage.timeline.2019.desc' },
    { year: '2021', titleKey: 'aboutPage.timeline.2021.title', descKey: 'aboutPage.timeline.2021.desc' },
    { year: '2023', titleKey: 'aboutPage.timeline.2023.title', descKey: 'aboutPage.timeline.2023.desc' },
    { year: '2025', titleKey: 'aboutPage.timeline.2025.title', descKey: 'aboutPage.timeline.2025.desc' },
  ];

  readonly values = [
    { icon: '🛡️', titleKey: 'aboutPage.values.safety.title', descKey: 'aboutPage.values.safety.desc' },
    { icon: '🐾', titleKey: 'aboutPage.values.care.title',   descKey: 'aboutPage.values.care.desc'   },
    { icon: '📋', titleKey: 'aboutPage.values.legal.title',  descKey: 'aboutPage.values.legal.desc'  },
    { icon: '🏠', titleKey: 'aboutPage.values.shelter.title', descKey: 'aboutPage.values.shelter.desc' },
    { icon: '🚐', titleKey: 'aboutPage.values.vehicle.title', descKey: 'aboutPage.values.vehicle.desc' },
    { icon: '🌍', titleKey: 'aboutPage.values.reach.title',  descKey: 'aboutPage.values.reach.desc'  },
  ];

  readonly testimonials = [
    {
      quote: 'aboutPage.testimonials.1.quote',
      name: 'aboutPage.testimonials.1.name',
      location: 'aboutPage.testimonials.1.location',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',
    },
    {
      quote: 'aboutPage.testimonials.2.quote',
      name: 'aboutPage.testimonials.2.name',
      location: 'aboutPage.testimonials.2.location',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5ec?w=80&h=80&fit=crop&crop=face',
    },
    {
      quote: 'aboutPage.testimonials.3.quote',
      name: 'aboutPage.testimonials.3.name',
      location: 'aboutPage.testimonials.3.location',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    },
  ];

  readonly trustBadges = [
    { icon: '✅', labelKey: 'aboutPage.trust.euCompliant'   },
    { icon: '🔒', labelKey: 'aboutPage.trust.insured'       },
    { icon: '🩺', labelKey: 'aboutPage.trust.vetApproved'   },
    { icon: '📍', labelKey: 'aboutPage.trust.gpsTracked'    },
    { icon: '🤝', labelKey: 'aboutPage.trust.shelterPartner' },
    { icon: '⚡', labelKey: 'aboutPage.trust.response24h'   },
  ];

  goToRequest(): void { this.router.navigate(['/request']); }
  goToContact(): void { this.router.navigate(['/contact']); }
}
