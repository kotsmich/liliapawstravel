import {
  Component, Input, ChangeDetectionStrategy,
  OnInit, OnDestroy, ChangeDetectorRef, inject,
} from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-about-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule],
  templateUrl: './about-section.component.html',
  styleUrls: ['./about-section.component.scss'],
})
export class AboutSectionComponent implements OnInit, OnDestroy {
  @Input() steps: Array<{ step: number; title: string; desc: string }> = [];

  private readonly cdr = inject(ChangeDetectorRef);

  readonly features = [
    { icon: '🛡️', titleKey: 'about.safetyFirst.title', descKey: 'about.safetyFirst.desc' },
    { icon: '🐾', titleKey: 'about.weCare.title',      descKey: 'about.weCare.desc'      },
    { icon: '📋', titleKey: 'about.fullyLegal.title',  descKey: 'about.fullyLegal.desc'  },
    { icon: '🏠', titleKey: 'about.shelterPartners.title', descKey: 'about.shelterPartners.desc' },
  ];

  readonly galleryImages = [
    {
      src: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80',
      alt: 'Dog looking out car window',
    },
    {
      src: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&q=80',
      alt: 'Dog portrait',
    },
    {
      src: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=800&q=80',
      alt: 'Cute dog close up',
    },
    {
      src: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&q=80',
      alt: 'Two dogs playing together',
    },
  ];

  readonly photos = [
    '/assets/images/van.png',
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&h=450&fit=crop',
    'https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=600&h=450&fit=crop',
    'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=600&h=450&fit=crop',
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&h=450&fit=crop',
  ];

  currentIndex = 0;
  private timer: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.startTimer();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  prev(): void {
    this.currentIndex = (this.currentIndex - 1 + this.photos.length) % this.photos.length;
    this.resetTimer();
    this.cdr.markForCheck();
  }

  next(): void {
    this.currentIndex = (this.currentIndex + 1) % this.photos.length;
    this.resetTimer();
    this.cdr.markForCheck();
  }

  goTo(index: number): void {
    this.currentIndex = index;
    this.resetTimer();
    this.cdr.markForCheck();
  }

  private startTimer(): void {
    this.timer = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.photos.length;
      this.cdr.markForCheck();
    }, 4500);
  }

  private stopTimer(): void {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  }

  private resetTimer(): void {
    this.stopTimer();
    this.startTimer();
  }
}
