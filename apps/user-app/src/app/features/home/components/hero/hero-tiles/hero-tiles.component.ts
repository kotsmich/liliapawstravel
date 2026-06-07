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

/** Base fall speed in pixels per second for the nearest depth plane. */
const SPEED = 50;

/** Longer edge of a near tile, as a fraction of hero width (clamped by TILE_MIN/MAX). */
const TILE_WIDTH_RATIO = 1 / 4.2;
const TILE_MIN = 200;
const TILE_MAX = 380;

/** Depth planes: 0 = farthest (small/slow/dim), 1 = nearest (large/fast/bright). */
const SIZE_FAR = 0.58;
const SIZE_NEAR = 1.16;
const SPEED_FAR = 0.5;
const SPEED_NEAR = 1.3;
const ALPHA_FAR = 0.5;
const ALPHA_NEAR = 1.0;

/** Warm peach accent (matches the hero title <em>) used to tint the drop shadow. */
const SHADOW_TINT = 'rgba(60, 35, 20, 0.42)';

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Hermite smoothstep: 0 below `edge0`, 1 above `edge1`, eased in between. */
const smoothstep = (edge0: number, edge1: number, x: number): number => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

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
  /** Depth plane in [0,1]; drives size, parallax speed and brightness. */
  depth: number;
  /** Parallax multiplier applied to the shared travel clock. */
  speedMul: number;
  /** Resting opacity for this depth (before edge fade). */
  baseAlpha: number;
  /** Soft drop-shadow blur / vertical offset, scaled by depth. */
  shadowBlur: number;
  shadowOffset: number;
  /** Horizontal drift amplitude (px) and phase for the floating sway. */
  swayAmp: number;
  swayPhase: number;
  /** Rotation wobble amplitude (radians) and phase. */
  wobbleAmp: number;
  wobblePhase: number;
  /** Breathing-scale phase, so tiles don't pulse in unison. */
  breathePhase: number;
}

/**
 * Ambient hero backdrop: a dreamy field of photo tiles drifting downward through
 * the banner. Tiles live on several parallax depth planes — nearer ones are
 * larger, faster, brighter and cast a stronger shadow; farther ones are small,
 * slow and dim — so the collage reads as a deep, floating space rather than a
 * flat grid. Each tile sways sideways, wobbles a touch, breathes, and fades
 * softly in at the top and out at the bottom, so photos materialise and dissolve
 * instead of hard-popping. Columns loop seamlessly (the wrap happens off-screen
 * behind the edge fade) and every photo in the manifest is used and cycled.
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
   * Build the columns. Each column sits on its own parallax depth plane, so a
   * column's tile size, fall speed and brightness all derive from one `depth`
   * value. Columns loop over their own `cycle` height, so a tile that slides off
   * the bottom reappears at the top with nothing visible at the seam (the wrap
   * happens off-screen, hidden further by the edge fade). Photos are dealt out
   * round-robin across all columns so every image appears, and tiles are drawn
   * far-to-near so nearer planes correctly overlap the distant ones.
   */
  private buildTiles(width: number, height: number): void {
    // Column count is sized to the near-plane tile so the field never feels sparse.
    const cols = Math.max(3, Math.round(width / this.longEdge));
    const colW = width / cols;

    const tiles: Tile[] = [];
    let imgIdx = 0;
    let tileIdx = 0;

    for (let c = 0; c < cols; c++) {
      // Golden-ratio low-discrepancy sequence → depths spread evenly but never
      // line up into an obvious near/far stripe pattern.
      const depth = ((c * 0.6180339887 + 0.13) % 1 + 1) % 1;

      const colEdge = this.longEdge * lerp(SIZE_FAR, SIZE_NEAR, depth);
      const speedMul = lerp(SPEED_FAR, SPEED_NEAR, depth);
      const baseAlpha = lerp(ALPHA_FAR, ALPHA_NEAR, depth);
      const shadowBlur = lerp(10, 30, depth);
      const shadowOffset = lerp(4, 14, depth);
      const swayAmp = lerp(6, 20, depth);
      const wobbleAmp = lerp(0.012, 0.05, depth); // radians (~0.7°–2.9°)

      const x = colW * (c + 0.5);

      // One loop spans the banner plus a full tile of clearance above and below,
      // so each tile is completely off-screen at the moment it wraps.
      const cycle = height + colEdge * 2.4;
      const perCol = Math.max(2, Math.round(cycle / (colEdge * 1.32)));
      const gap = cycle / perCol;
      // Stagger each column by a fraction of a slot so rows never line up.
      const colOffset = ((c * 0.41) % 1) * gap;

      for (let k = 0; k < perCol; k++) {
        const img = this.loadedImages[imgIdx % this.loadedImages.length];
        imgIdx++;
        const scale = colEdge / Math.max(img.naturalWidth || 1, img.naturalHeight || 1);
        const w = Math.round((img.naturalWidth || 1) * scale);
        const h = Math.round((img.naturalHeight || 1) * scale);
        // Spread the per-tile motion phases with another golden-ratio walk so no
        // two tiles sway, wobble or breathe in lockstep.
        const g = tileIdx * 0.6180339887;
        tiles.push({
          img,
          x,
          phase: (k * gap + colOffset) % cycle,
          cycle,
          w,
          h,
          r: Math.min(w, h) * 0.14,
          depth,
          speedMul,
          baseAlpha,
          shadowBlur,
          shadowOffset,
          swayAmp,
          swayPhase: (g % 1) * Math.PI * 2,
          wobbleAmp,
          wobblePhase: ((g * 1.7) % 1) * Math.PI * 2,
          breathePhase: ((g * 2.3) % 1) * Math.PI * 2,
        });
        tileIdx++;
      }
    }

    // Far planes first so nearer, brighter tiles layer on top of distant ones.
    tiles.sort((a, b) => a.depth - b.depth);
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
    const width = el.clientWidth;
    const height = el.clientHeight;
    const clock = this.travelled;
    ctx.clearRect(0, 0, width, height);

    for (const t of this.tiles) {
      // Parallax: nearer planes advance faster through the shared clock.
      const raw = (((t.phase + clock * t.speedMul) % t.cycle) + t.cycle) % t.cycle;
      const y = raw - t.h; // centre starts above the top, then falls down
      const half = t.h / 2;
      if (y + half < -2 || y - half > height + 2) continue; // off-screen — skip

      // Soft materialise / dissolve near the edges (band scales with tile size).
      const band = t.h * 0.85;
      const fade =
        smoothstep(-band * 0.35, band * 0.6, y) *
        (1 - smoothstep(height - band * 0.6, height + band * 0.35, y));
      if (fade <= 0.001) continue;

      // Floating life: gentle horizontal sway, tiny rotation wobble, slow breath.
      const sway = Math.sin(clock * 0.018 + t.swayPhase) * t.swayAmp;
      const wobble = Math.sin(clock * 0.02 + t.wobblePhase) * t.wobbleAmp;
      const breathe = 1 + Math.sin(clock * 0.015 + t.breathePhase) * 0.02;

      ctx.save();
      ctx.globalAlpha = t.baseAlpha * fade;
      ctx.translate(t.x + sway, y);
      ctx.rotate(wobble);
      ctx.scale(breathe, breathe);

      const hw = t.w / 2;
      const hh = t.h / 2;

      // White backing card + soft, warm-tinted drop shadow.
      this.roundedPath(ctx, -hw, -hh, t.w, t.h, t.r);
      ctx.shadowColor = SHADOW_TINT;
      ctx.shadowBlur = t.shadowBlur;
      ctx.shadowOffsetY = t.shadowOffset;
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.shadowColor = 'transparent';

      // Clip to the rounded card, draw the photo, then lay a glossy sheen and a
      // crisp inner highlight over it — all inside the clip.
      this.roundedPath(ctx, -hw, -hh, t.w, t.h, t.r);
      ctx.clip();
      ctx.drawImage(t.img, -hw, -hh, t.w, t.h);

      const sheen = ctx.createLinearGradient(-hw, -hh, hw, hh);
      sheen.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
      sheen.addColorStop(0.4, 'rgba(255, 255, 255, 0.04)');
      sheen.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = sheen;
      ctx.fillRect(-hw, -hh, t.w, t.h);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
      ctx.lineWidth = 1;
      this.roundedPath(ctx, -hw + 0.5, -hh + 0.5, t.w - 1, t.h - 1, Math.max(0, t.r - 0.5));
      ctx.stroke();

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
