import {
  Component, ChangeDetectionStrategy, inject,
  OnInit, OnDestroy, ChangeDetectorRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { CtaSectionComponent } from '@user/features/home/components/cta-section/cta-section.component';

@Component({
  selector: 'app-about',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule, CtaSectionComponent],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly cdr    = inject(ChangeDetectorRef);

  readonly heroSlides = [
    'assets/images/about-hero-1.jpeg',
    'assets/images/about-hero-2.jpeg',
    'assets/images/about-hero-3.jpeg',
    'assets/images/about-hero-4.jpeg',
  ];

  currentSlide = 0;
  private slideTimer: ReturnType<typeof setInterval> | null = null;

  readonly storyPhotos = [
    'assets/images/story-1.jpg',
    'assets/images/story-2.jpg',
    'assets/images/story-3.jpg',
    'assets/images/story-4.jpg',
    'assets/images/story-5.jpg',
  ];

  ngOnInit(): void {
    this.slideTimer = setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.heroSlides.length;
      this.cdr.markForCheck();
    }, 3500);
  }

  ngOnDestroy(): void {
    if (this.slideTimer) clearInterval(this.slideTimer);
  }

  readonly values = [
    { icon: '🛡️', titleKey: 'aboutPage.values.safety.title', descKey: 'aboutPage.values.safety.desc' },
    { icon: '🐾', titleKey: 'aboutPage.values.care.title',   descKey: 'aboutPage.values.care.desc'   },
    { icon: '📋', titleKey: 'aboutPage.values.legal.title',  descKey: 'aboutPage.values.legal.desc'  },
    { icon: '🏠', titleKey: 'aboutPage.values.shelter.title', descKey: 'aboutPage.values.shelter.desc' },
    { icon: '🚐', titleKey: 'aboutPage.values.vehicle.title', descKey: 'aboutPage.values.vehicle.desc' },
    { icon: '🌍', titleKey: 'aboutPage.values.reach.title',  descKey: 'aboutPage.values.reach.desc'  },
  ];


  goToRequest(): void { this.router.navigate(['/request']); }
  goToContact(): void { this.router.navigate(['/contact']); }
}
