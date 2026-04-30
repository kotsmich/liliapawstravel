import { Component, Input, ChangeDetectionStrategy, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { autoRotate } from '@user/shared/auto-rotate';
import { LinkService } from '@user/services/link.service';

@Component({
  selector: 'app-about-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule, RouterLink, NgOptimizedImage],
  templateUrl: './about-section.component.html',
  styleUrls: ['./about-section.component.scss'],
})
export class AboutSectionComponent {
  @Input() steps: Array<{ step: number; title: string; desc: string }> = [];

  protected readonly linkService = inject(LinkService);

  readonly features = [
    { icon: '🛡️', titleKey: 'about.safetyFirst.title', descKey: 'about.safetyFirst.desc' },
    { icon: '🐾', titleKey: 'about.weCare.title',      descKey: 'about.weCare.desc'      },
    { icon: '📋', titleKey: 'about.fullyLegal.title',  descKey: 'about.fullyLegal.desc'  },
    { icon: '🏠', titleKey: 'about.shelterPartners.title', descKey: 'about.shelterPartners.desc' },
  ];

  readonly galleryImages = [
    { src: 'assets/images/gallery-1.webp', altKey: 'gallery.alt.rescuedDog' },
    { src: 'assets/images/gallery-2.webp', altKey: 'gallery.alt.onTransport' },
    { src: 'assets/images/gallery-3.webp', altKey: 'gallery.alt.happyDog' },
    { src: 'assets/images/gallery-4.webp', altKey: 'gallery.alt.portrait' },
  ];

  readonly photos = [
    'assets/images/photo-1.webp',
    'assets/images/photo-2.webp',
    'assets/images/photo-3.webp',
    'assets/images/photo-4.webp',
  ];

  readonly fleetPhotos = [
    'assets/images/van-daylight.webp',
    'assets/images/fleet-van.webp',
    'assets/images/van.webp',
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
