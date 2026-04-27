import { DestroyRef, PLATFORM_ID, Signal, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface AutoRotate {
  /** Current active index. */
  readonly index: Signal<number>;
  /** Move to a specific index and reset the timer. */
  goTo(index: number): void;
  /** Move forward by one and reset the timer. */
  next(): void;
  /** Move backward by one and reset the timer. */
  prev(): void;
}

/**
 * Returns a signal-driven auto-advancing index that wraps around `length()`.
 * Must be called from an injection context. Cleans itself up via DestroyRef.
 */
export function autoRotate(length: () => number, intervalMs: number): AutoRotate {
  const platformId = inject(PLATFORM_ID);
  const destroyRef = inject(DestroyRef);
  const index = signal(0);
  let timer: ReturnType<typeof setInterval> | null = null;

  const stop = (): void => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };

  const start = (): void => {
    if (!isPlatformBrowser(platformId)) return;
    stop();
    timer = setInterval(() => {
      const total = length();
      if (total > 0) index.update((current) => (current + 1) % total);
    }, intervalMs);
  };

  start();
  destroyRef.onDestroy(stop);

  return {
    index,
    goTo: (target: number) => { index.set(target); start(); },
    next: () => { const total = length(); if (total > 0) { index.update((current) => (current + 1) % total); start(); } },
    prev: () => { const total = length(); if (total > 0) { index.update((current) => (current - 1 + total) % total); start(); } },
  };
}
