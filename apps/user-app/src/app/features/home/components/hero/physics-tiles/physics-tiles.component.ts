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
import type { Engine, Render, Runner, Body } from 'matter-js';

interface Tile {
  body: Body;
  img: HTMLImageElement;
  w: number;
  h: number;
  r: number;
}

/**
 * Ambient physics backdrop: photo tiles fall under gravity, collide and pile
 * up against each other, and are pushed away by the cursor. Browser-only —
 * everything is set up inside `afterNextRender`, so the SSR pass never touches
 * `window`/`document` and `matter-js` is dynamically imported on the client.
 */
@Component({
  selector: 'app-physics-tiles',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas #canvas class="tiles__canvas" aria-hidden="true"></canvas>`,
  styleUrl: './physics-tiles.component.scss',
})
export class PhysicsTilesComponent {
  /** Tile image URLs (relative to the app, e.g. assets/images/tiles/tile-01.webp). */
  readonly images = input<string[]>([]);

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  // matter-js handles (loaded in the browser only)
  private Matter: any;
  private engine?: Engine;
  private render?: Render;
  private runner?: Runner;
  private walls: Body[] = [];
  private tiles: Tile[] = [];

  private readonly mouse = { x: 0, y: 0, active: false };
  private resizeObserver?: ResizeObserver;
  private animated = true;

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

    const mod: any = await import('matter-js');
    const Matter = mod.default ?? mod;
    this.Matter = Matter;
    // Component may have been destroyed while the chunk was loading.
    if (!this.canvasRef()) return;

    this.animated = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const canvas = this.canvasRef().nativeElement;
    const { width, height } = this.size();

    const engine = Matter.Engine.create({ gravity: { x: 0, y: this.animated ? 0.6 : 0 } });
    this.engine = engine;

    this.render = Matter.Render.create({
      canvas,
      engine,
      options: {
        width,
        height,
        background: 'transparent',
        wireframes: false,
        pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      },
    });

    this.buildWalls(width, height);

    // Spread the photos across enough tiles to fill the banner (they stack a
    // few rows deep), cycling the source images when there are more slots than
    // photos.
    const target = Math.max(14, Math.min(40, Math.round(width / 80)));
    const longEdge = Math.max(113, Math.min(188, width / 8.8));
    const slots = Array.from({ length: target }, (_, i) => urls[i % urls.length]);

    // Lay the tiles out in a non-overlapping grid ABOVE the viewport so they
    // rain down cleanly — spawning them on top of each other makes the engine
    // explosively push them apart (and off-screen).
    const cols = Math.max(1, Math.floor(width / (longEdge * 1.2)));
    const colW = width / cols;
    await Promise.all(
      slots.map((url, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = colW * (col + 0.5) + (Math.random() - 0.5) * colW * 0.25;
        const y = this.animated
          ? -longEdge * 0.7 - row * longEdge * 1.25
          : 40 + Math.random() * Math.max(1, height - 80);
        return this.addTile(url, longEdge, x, y);
      }),
    );

    // Draw photos ourselves (rounded corners + shadow) instead of Matter sprites.
    Matter.Events.on(this.render, 'afterRender', () => this.drawTiles());

    // Cursor repels nearby tiles. Listen on window (overlays/content paint
    // above the canvas and would otherwise swallow the events) and gate by the
    // canvas bounds.
    if (this.animated) {
      Matter.Events.on(engine, 'beforeUpdate', () => this.repel());
      window.addEventListener('pointermove', this.onPointerMove, { passive: true });
    }

    Matter.Render.run(this.render);
    if (this.animated) {
      this.runner = Matter.Runner.create();
      Matter.Runner.run(this.runner, engine);
    } else {
      // One static frame is enough when motion is reduced.
      Matter.Render.world(this.render);
    }

    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(this.host.nativeElement);
  }

  private size(): { width: number; height: number } {
    const el = this.host.nativeElement;
    return {
      width: Math.max(1, el.clientWidth),
      height: Math.max(1, el.clientHeight),
    };
  }

  private buildWalls(width: number, height: number): void {
    const { Bodies, Composite } = this.Matter;
    if (this.walls.length) Composite.remove(this.engine!.world, this.walls);
    const t = 240;
    const opts = { isStatic: true, render: { visible: false } };
    // No ceiling: tiles spawn above the viewport and rain in. Make the side
    // walls tall enough to corral them while they're still up there.
    this.walls = [
      Bodies.rectangle(width / 2, height + t / 2, width + 2 * t, t, opts), // floor
      Bodies.rectangle(-t / 2, height / 2, t, (height + 2 * t) * 3, opts), // left
      Bodies.rectangle(width + t / 2, height / 2, t, (height + 2 * t) * 3, opts), // right
    ];
    Composite.add(this.engine!.world, this.walls);
  }

  private addTile(url: string, longEdge: number, x: number, y: number): Promise<void> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const { Bodies, Composite } = this.Matter;
        const scale = longEdge / Math.max(img.naturalWidth, img.naturalHeight);
        const w = Math.round(img.naturalWidth * scale);
        const h = Math.round(img.naturalHeight * scale);
        const body = Bodies.rectangle(x, y, w, h, {
          restitution: 0.3,
          friction: 0.1,
          frictionAir: 0.02,
          density: 0.0012,
          angle: 0,
          inertia: Infinity, // lock rotation — tiles stay upright, never flip
          chamfer: { radius: Math.min(w, h) * 0.14 },
          render: { visible: false },
        });
        Composite.add(this.engine!.world, body);
        this.tiles.push({ body, img, w, h, r: Math.min(w, h) * 0.14 });
        resolve();
      };
      img.onerror = () => resolve();
      img.src = url;
    });
  }

  private drawTiles(): void {
    const ctx = this.render!.context as CanvasRenderingContext2D;
    for (const t of this.tiles) {
      const { x, y } = t.body.position;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(t.body.angle);

      // white backing card + soft shadow
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

  private repel(): void {
    if (!this.mouse.active) return;
    const { Body } = this.Matter;
    const radius = 100;
    for (const t of this.tiles) {
      const dx = t.body.position.x - this.mouse.x;
      const dy = t.body.position.y - this.mouse.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 0 && dist < radius) {
        const strength = 0.003 * t.body.mass * (1 - dist / radius);
        Body.applyForce(t.body, t.body.position, {
          x: (dx / dist) * strength,
          y: (dy / dist) * strength,
        });
      }
    }
  }

  private readonly onPointerMove = (e: PointerEvent): void => {
    const rect = this.canvasRef().nativeElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    this.mouse.x = x;
    this.mouse.y = y;
    // only repel while the cursor is actually over the hero canvas
    this.mouse.active = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
  };

  private onResize(): void {
    if (!this.render) return;
    const { width, height } = this.size();
    const pr = Math.min(window.devicePixelRatio || 1, 2);
    this.render.options.width = width;
    this.render.options.height = height;
    this.render.canvas.width = width * pr;
    this.render.canvas.height = height * pr;
    this.render.canvas.style.width = `${width}px`;
    this.render.canvas.style.height = `${height}px`;
    this.render.bounds.max.x = width;
    this.render.bounds.max.y = height;
    this.render.context.setTransform(pr, 0, 0, pr, 0, 0);
    this.buildWalls(width, height);
    if (!this.animated) this.Matter.Render.world(this.render);
  }

  private teardown(): void {
    const M = this.Matter;
    window.removeEventListener('pointermove', this.onPointerMove);
    this.resizeObserver?.disconnect();
    if (M && this.runner) M.Runner.stop(this.runner);
    if (M && this.render) M.Render.stop(this.render);
    if (M && this.engine) {
      M.World.clear(this.engine.world, false);
      M.Engine.clear(this.engine);
    }
    this.tiles = [];
    this.walls = [];
  }
}
