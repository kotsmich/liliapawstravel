import { Component, Input, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
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

  private cdr = inject(ChangeDetectorRef);

  photos = [
    'assets/images/van.png',
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=450&fit=crop',
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&h=450&fit=crop',
    'https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=600&h=450&fit=crop',
    'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=600&h=450&fit=crop',
  ];

  currentIndex = 0;
  private timer: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.timer = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.photos.length;
      this.cdr.markForCheck();
    }, 4000);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  prev(): void {
    this.currentIndex = (this.currentIndex - 1 + this.photos.length) % this.photos.length;
    this.resetTimer();
  }

  next(): void {
    this.currentIndex = (this.currentIndex + 1) % this.photos.length;
    this.resetTimer();
  }

  goTo(index: number): void {
    this.currentIndex = index;
    this.resetTimer();
  }

  private resetTimer(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.photos.length;
      this.cdr.markForCheck();
    }, 4000);
  }
}
