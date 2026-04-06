import {
  Component, Output, EventEmitter, ChangeDetectionStrategy,
  OnInit, OnDestroy, ChangeDetectorRef, inject,
} from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-hero',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'],
})
export class HeroComponent implements OnInit, OnDestroy {
  @Output() requestClicked = new EventEmitter<void>();
  @Output() contactClicked = new EventEmitter<void>();

  private readonly cdr = inject(ChangeDetectorRef);

  readonly slides = [
    {
      image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1600&q=85',
      captionKey: 'hero.slides.safeInTransit',
    },
    {
      image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1600&q=85',
      captionKey: 'hero.slides.everyPawMatters',
    },
    {
      image: 'https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=1600&q=85',
      captionKey: 'hero.slides.goldenHeading',
    },
    {
      image: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=1600&q=85',
      captionKey: 'hero.slides.adoptedWithLove',
    },
  ];

  currentSlide = 0;
  private timer: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.startTimer();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  goTo(index: number): void {
    this.currentSlide = index;
    this.resetTimer();
    this.cdr.markForCheck();
  }

  private startTimer(): void {
    this.timer = setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.slides.length;
      this.cdr.markForCheck();
    }, 6000);
  }

  private stopTimer(): void {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  }

  private resetTimer(): void {
    this.stopTimer();
    this.startTimer();
  }
}
