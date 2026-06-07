import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  afterNextRender,
  inject,
  input,
  viewChild,
  DestroyRef,
} from '@angular/core';

/** Fall speed in pixels per second — higher = tiles drop faster. */
const SPEED = 46;

/** Longer edge of a tile, as a fraction of hero width (clamped by TILE_MIN/MAX). */
const TILE_WIDTH_RATIO = 1 / 4.5;
const TILE_MIN = 210;
const TILE_MAX = 390;

interface Tile {
  img: HTMLImageElement;
  /** Column centre, in CSS pixels. */
  x: number;
  /** Starting position within the column's vertical cycle. */
  phase: number;
  /** Length of one full loop for this tile's column. */
  cycle: number;
  w: number;
  h: number;
  r: number;
}

/**
 * Ambient hero backdrop: photo tiles drop in from above the viewport, fall
 * straight down through the banner, slide off the bottom, and loop back to the
 * top forever — a seamless vertical cascade across several columns. Every photo
 * in the manifest is used and cycled, so the list can be any length.
 *
 * Pure canvas + requestAnimationFrame, no physics engine. Browser-only:
 * everything runs inside `afterNextRender`, so the SSR pass never touches
 * `window`/`document`.
 */
@Component({
  selector: 'app-hero-tiles',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas #canvas class="tiles__canvas" aria-hidden="true"></canvas>`,
  styleUrl: './hero-tiles.component.scss',
})
export class HeroTilesComponent {
  /** Tile image URLs (relative to the app, e.g. assets/images/tiles/tile-01.webp). */
  readonly images = input<string[]>([]);

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  private ctx?: CanvasRenderingContext2D;
  private loadedImages: HTMLImageElement[] = [];
  private tiles: Tile[] = [];
  private longEdge = TILE_MIN;

  private rafId = 0;
  private lastTime = 0;
  /** Distance fallen so far, in pixels — drives every tile's position. */
  private travelled = 0;
  private animated = true;
  private resizeObserver?: ResizeObserver;

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      void this.setup();
      destroyRef.onDestroy(() => this.teardown());
    });
  }

  private async setup(): Promise<void> {
    const urls = this.images();
    if (urls.length === 0) return;

    const canvas = this.canvasRef().nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    this.ctx = ctx;

    this.animated = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const loaded = await Promise.all(urls.map((url) => this.loadImage(url)));
    // Component may have been destroyed while images were loading.
    if (!this.canvasRef()) return;
    this.loadedImages = loaded.filter((img): img is HTMLImageElement => img !== null);
    if (this.loadedImages.length === 0) return;

    this.rebuild();

    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(this.host.nativeElement);

    if (this.animated) {
      this.rafId = requestAnimationFrame((t) => this.frame(t));
    } else {
      this.draw();
    }
  }

  /** Size the canvas, then lay the columns of tiles out for the current bounds. */
  private rebuild(): void {
    const el = this.host.nativeElement;
    const width = Math.max(1, el.clientWidth);
    const height = Math.max(1, el.clientHeight);
    const pr = Math.min(window.devicePixelRatio || 1, 2);

    const canvas = this.canvasRef().nativeElement;
    canvas.width = Math.round(width * pr);
    canvas.height = Math.round(height * pr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    this.ctx!.setTransform(pr, 0, 0, pr, 0, 0);

    this.longEdge = Math.max(TILE_MIN, Math.min(TILE_MAX, Math.round(width * TILE_WIDTH_RATIO)));
    this.buildTiles(width, height);
  }

  /**
   * Build the columns. Each column loops over the same `cycle` height, so a tile
   * that slides off the bottom reappears at the top with nothing visible at the
   * seam (the wrap happens fully off-screen). Tiles are spaced evenly and photos
   * are dealt out round-robin across all columns so every image appears.
   */
  private buildTiles(width: number, height: number): void {
    const cols = Math.max(2, Math.round(width / this.longEdge));
    const colW = width / cols;
    // One loop spans the banner plus a full tile of clearance above and below,
    // so each tile is completely off-screen at the moment it wraps.
    const cycle = height + this.longEdge * 2;
    const perCol = Math.max(2, Math.round(cycle / (this.longEdge * 1.18)));
    const gap = cycle / perCol;

    const tiles: Tile[] = [];
    let imgIdx = 0;
    for (let c = 0; c < cols; c++) {
      const x = colW * (c + 0.5);
      // Stagger alternate columns by half a slot so rows don't line up.
      const colOffset = (c % 2) * gap * 0.5;
      for (let k = 0; k < perCol; k++) {
        const img = this.loadedImages[imgIdx % this.loadedImages.length];
        imgIdx++;
        const scale = this.longEdge / Math.max(img.naturalWidth || 1, img.naturalHeight || 1);
        const w = Math.round((img.naturalWidth || 1) * scale);
        const h = Math.round((img.naturalHeight || 1) * scale);
        tiles.push({
          img,
          x,
          phase: (k * gap + colOffset) % cycle,
          cycle,
          w,
          h,
          r: Math.min(w, h) * 0.14,
        });
      }
    }
    this.tiles = tiles;
  }

  private frame(time: number): void {
    if (this.lastTime === 0) this.lastTime = time;
    const dt = Math.min(0.05, (time - this.lastTime) / 1000); // clamp tab-switch jumps
    this.lastTime = time;
    this.travelled += SPEED * dt;
    this.draw();
    this.rafId = requestAnimationFrame((t) => this.frame(t));
  }

  private draw(): void {
    const ctx = this.ctx!;
    const el = this.host.nativeElement;
    const height = el.clientHeight;
    ctx.clearRect(0, 0, el.clientWidth, height);

    for (const t of this.tiles) {
      const raw = (((t.phase + this.travelled) % t.cycle) + t.cycle) % t.cycle;
      const y = raw - t.h; // centre starts above the top, then falls down
      if (y + t.h / 2 < 0 || y - t.h / 2 > height) continue; // off-screen — skip

      ctx.save();
      ctx.translate(t.x, y);

      // white backing card + soft shadow (tiles stay upright — no rotation)
      this.roundedPath(ctx, -t.w / 2, -t.h / 2, t.w, t.h, t.r);
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 22;
      ctx.shadowOffsetY = 8;
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.shadowColor = 'transparent';

      // clip to the rounded card and draw the photo
      this.roundedPath(ctx, -t.w / 2, -t.h / 2, t.w, t.h, t.r);
      ctx.clip();
      ctx.drawImage(t.img, -t.w / 2, -t.h / 2, t.w, t.h);
      ctx.restore();
    }
  }

  private roundedPath(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
  ): void {
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x, y, w, h, r);
    } else {
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }
  }

  private loadImage(url: string): Promise<HTMLImageElement | null> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  private onResize(): void {
    if (!this.ctx) return;
    this.rebuild();
    if (!this.animated) this.draw();
  }

  private teardown(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.resizeObserver?.disconnect();
    this.tiles = [];
    this.loadedImages = [];
  }
}
