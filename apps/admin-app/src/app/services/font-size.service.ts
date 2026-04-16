import { Injectable, inject, signal, effect } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class FontSizeService {
  private readonly STORAGE_KEY = 'admin-font-size';
  private readonly document = inject(DOCUMENT);

  /** Font size as a percentage of the browser default. Range: 80–120, default: 100. */
  readonly size = signal<number>(this.load());

  constructor() {
    effect(() => {
      const value = this.size();
      this.document.documentElement.style.fontSize = value + '%';
      try {
        localStorage.setItem(this.STORAGE_KEY, String(value));
      } catch {
        // Storage unavailable (private browsing, quota exceeded) — preference not persisted.
      }
    });
  }

  private load(): number {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved ? Number(saved) : 100;
    } catch {
      return 100;
    }
  }
}
