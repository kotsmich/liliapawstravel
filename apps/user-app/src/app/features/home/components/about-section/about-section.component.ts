import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { autoRotate } from '@user/shared/auto-rotate';

@Component({
  selector: 'app-about-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule, RouterLink],
  templateUrl: './about-section.component.html',
  styleUrls: ['./about-section.component.scss'],
})
export class AboutSectionComponent {
  @Input() steps: Array<{ step: number; title: string; desc: string }> = [];

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

  private readonly photoRotation = autoRotate(() => this.photos.length, 4500);
  private readonly fleetRotation = autoRotate(() => this.fleetPhotos.length, 4500);

  readonly currentIndex = this.photoRotation.index;
  readonly fleetIndex = this.fleetRotation.index;

  prev(): void { this.photoRotation.prev(); }
  next(): void { this.photoRotation.next(); }
  goTo(index: number): void { this.photoRotation.goTo(index); }

  fleetPrev(): void { this.fleetRotation.prev(); }
  fleetNext(): void { this.fleetRotation.next(); }
  fleetGoTo(index: number): void { this.fleetRotation.goTo(index); }
}
