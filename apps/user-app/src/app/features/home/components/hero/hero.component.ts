import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { autoRotate } from '@user/shared/auto-rotate';

@Component({
  selector: 'app-hero',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'],
})
export class HeroComponent {
  @Output() requestClicked = new EventEmitter<void>();
  @Output() contactClicked = new EventEmitter<void>();

  readonly slides = [
    { image: 'assets/images/van-daylight.png', captionKey: 'hero.slides.safeInTransit' },
    { image: 'assets/images/hero-2.jpeg',      captionKey: 'hero.slides.everyPawMatters' },
    { image: 'assets/images/hero-3.jpeg',      captionKey: 'hero.slides.goldenHeading' },
    { image: 'assets/images/hero-4.jpeg',      captionKey: 'hero.slides.adoptedWithLove' },
  ];

  private readonly rotation = autoRotate(() => this.slides.length, 6000);
  readonly currentSlide = this.rotation.index;

  goTo(index: number): void { this.rotation.goTo(index); }
}
