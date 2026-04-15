import {
  Component, Input, ChangeDetectionStrategy,
  OnInit, OnDestroy, ChangeDetectorRef, inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-about-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule, RouterLink],
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
    { src: 'assets/images/gallery-1.jpeg', alt: 'Rescued dog' },
    { src: 'assets/images/gallery-2.jpeg', alt: 'Dog on transport' },
    { src: 'assets/images/gallery-3.jpeg', alt: 'Happy dog' },
    { src: 'assets/images/gallery-4.jpeg', alt: 'Dog portrait' },
  ];

  readonly photos = [
    'assets/images/photo-1.jpeg',
    'assets/images/photo-2.jpeg',
    'assets/images/photo-3.jpeg',
    'assets/images/photo-4.jpeg',
  ];

  readonly fleetPhotos = [
    'assets/images/van-daylight.png',
    'assets/images/fleet-van.png',
    'assets/images/van.png',
  ];

  currentIndex = 0;
  fleetIndex = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  private fleetTimer: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.startTimer();
    this.startFleetTimer();
  }

  ngOnDestroy(): void {
    this.stopTimer();
    this.stopFleetTimer();
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

  fleetPrev(): void {
    this.fleetIndex = (this.fleetIndex - 1 + this.fleetPhotos.length) % this.fleetPhotos.length;
    this.resetFleetTimer();
    this.cdr.markForCheck();
  }

  fleetNext(): void {
    this.fleetIndex = (this.fleetIndex + 1) % this.fleetPhotos.length;
    this.resetFleetTimer();
    this.cdr.markForCheck();
  }

  fleetGoTo(index: number): void {
    this.fleetIndex = index;
    this.resetFleetTimer();
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

  private startFleetTimer(): void {
    this.fleetTimer = setInterval(() => {
      this.fleetIndex = (this.fleetIndex + 1) % this.fleetPhotos.length;
      this.cdr.markForCheck();
    }, 4500);
  }

  private stopFleetTimer(): void {
    if (this.fleetTimer) { clearInterval(this.fleetTimer); this.fleetTimer = null; }
  }

  private resetFleetTimer(): void {
    this.stopFleetTimer();
    this.startFleetTimer();
  }
}
