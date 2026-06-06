import { Component, Input, ChangeDetectionStrategy, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { autoRotate } from '@user/shared/auto-rotate';
import { LinkService } from '@user/services/link.service';

/** Splits a flat list into fixed-size groups (the last group may be smaller). */
function chunk<T>(items: readonly T[], size: number): T[][] {
  const groups: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    groups.push(items.slice(i, i + size));
  }
  return groups;
}

/** Photos per gallery slide — keep the source list in multiples of this. */
const GALLERY_SLIDE_SIZE = 4;

/** How many gallery-{n}.webp files exist in assets/images/. Bump when you add more. */
const GALLERY_PHOTO_COUNT = 13;

/** How many fleet-{n}.webp files exist in assets/images/. Bump when you add more. */
const FLEET_PHOTO_COUNT = 4;

/** How many who-{n}.webp files exist in assets/images/. Bump when you add more. */
const WHO_PHOTO_COUNT = 6;

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

  /**
   * Gallery photos live at assets/images/gallery-{1..N}.webp and are auto-grouped
   * into slides of GALLERY_SLIDE_SIZE (4). To add more, drop the next-numbered
   * webp files in and bump GALLERY_PHOTO_COUNT — ideally keep it a multiple of 4
   * so the last group fills all four tiles. Only the active group is rendered, so
   * extra groups cost nothing up front.
   */
  readonly galleryPhotos = Array.from(
    { length: GALLERY_PHOTO_COUNT },
    (_, i) => `assets/images/gallery-${i + 1}.webp`,
  );

  readonly gallerySlides = chunk(this.galleryPhotos, GALLERY_SLIDE_SIZE);

  /**
   * "Who we are" photos live at assets/images/who-{1..N}.webp. To add more, drop
   * the next-numbered webp files in and bump WHO_PHOTO_COUNT — they auto-appear in
   * the about slider in order.
   */
  readonly photos = Array.from(
    { length: WHO_PHOTO_COUNT },
    (_, i) => `assets/images/who-${i + 1}.webp`,
  );

  /**
   * Fleet photos live at assets/images/fleet-{1..N}.webp. To add more, drop the
   * next-numbered webp files in and bump FLEET_PHOTO_COUNT — they auto-appear in
   * the fleet slider in order.
   */
  readonly fleetPhotos = Array.from(
    { length: FLEET_PHOTO_COUNT },
    (_, i) => `assets/images/fleet-${i + 1}.webp`,
  );

  private readonly photoRotation = autoRotate(() => this.photos.length, 4500);
  private readonly fleetRotation = autoRotate(() => this.fleetPhotos.length, 4500);
  private readonly galleryRotation = autoRotate(() => this.gallerySlides.length, 6000);

  readonly currentIndex = this.photoRotation.index;
  readonly fleetIndex = this.fleetRotation.index;
  readonly galleryIndex = this.galleryRotation.index;

  prev(): void { this.photoRotation.prev(); }
  next(): void { this.photoRotation.next(); }

  fleetPrev(): void { this.fleetRotation.prev(); }
  fleetNext(): void { this.fleetRotation.next(); }

  galleryPrev(): void { this.galleryRotation.prev(); }
  galleryNext(): void { this.galleryRotation.next(); }

  /** Zero-pads a 1-based position for the "06 / 07" album counter. */
  protected pad(n: number): string {
    return n.toString().padStart(2, '0');
  }
}
