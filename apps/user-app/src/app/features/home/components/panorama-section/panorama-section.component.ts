import {
  Component, ChangeDetectionStrategy, ElementRef, ViewChild,
  AfterViewInit, OnDestroy, PLATFORM_ID, inject, input,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { Viewer } from '@photo-sphere-viewer/core';

@Component({
  selector: 'app-panorama-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="pano-section">
      <div class="pano-section__header">
        <span class="pano-eyebrow">360° View</span>
        <h2>Inside the Van</h2>
        <p>Drag to look around — experience the space our dogs travel in.</p>
      </div>

      <div class="pano-section__tabs">
        @for (p of panoramas; track p.src; let i = $index) {
          <button
            class="pano-tab"
            [class.active]="i === activeIndex"
            (click)="switchTo(i)"
          >{{ p.label }}</button>
        }
      </div>

      <div class="pano-section__viewer" #viewerEl></div>
    </section>
  `,
  styles: [`
    .pano-section {
      background: #1a1008;
      padding: 5rem 1.5rem;
    }

    .pano-section__header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .pano-eyebrow {
      display: inline-flex; align-items: center; gap: .5rem;
      color: #e07b54; font-size: .75rem;
      font-weight: 700; letter-spacing: .12em; text-transform: uppercase;
      margin-bottom: .75rem;

      &::before {
        content: ''; display: inline-block;
        width: 20px; height: 2px;
        background: #e07b54; border-radius: 2px;
      }
    }

    h2 {
      font-family: var(--font-display, 'Playfair Display', Georgia, serif);
      font-size: clamp(1.8rem, 3.5vw, 2.6rem);
      font-weight: 700; color: #fff;
      margin-bottom: .6rem;
    }

    p {
      color: rgba(255,255,255,.55);
      font-size: .95rem;
    }

    .pano-section__tabs {
      display: flex; justify-content: center; gap: .6rem;
      margin-bottom: 1.5rem;
    }

    .pano-tab {
      padding: .45rem 1.1rem;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,.2);
      background: transparent;
      color: rgba(255,255,255,.6);
      font-size: .82rem; font-weight: 600;
      cursor: pointer;
      transition: all .2s;

      &.active, &:hover {
        background: #e07b54;
        border-color: #e07b54;
        color: #fff;
      }
    }

    .pano-section__viewer {
      max-width: 1100px;
      margin: 0 auto;
      height: 520px;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 32px 80px rgba(0,0,0,.5);

      @media (max-width: 600px) { height: 300px; }
    }
  `],
})
export class PanoramaSectionComponent implements AfterViewInit, OnDestroy {
  @ViewChild('viewerEl') viewerEl!: ElementRef<HTMLDivElement>;

  private readonly platformId = inject(PLATFORM_ID);
  private viewer: Viewer | null = null;
  activeIndex = 0;

  readonly panoramas = [
    { src: 'assets/images/pano-1.jpg', label: 'View 1' },
  ];

  async ngAfterViewInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    const { Viewer } = await import('@photo-sphere-viewer/core');

    this.viewer = new Viewer({
      container: this.viewerEl.nativeElement,
      panorama: this.panoramas[0].src,
      defaultZoomLvl: 0,
      navbar: false,
      touchmoveTwoFingers: false,
    });
  }

  switchTo(index: number): void {
    this.activeIndex = index;
    this.viewer?.setPanorama(this.panoramas[index].src);
  }

  ngOnDestroy(): void {
    this.viewer?.destroy();
  }
}
