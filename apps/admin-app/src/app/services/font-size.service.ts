import { Injectable, signal, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FontSizeService {
  private readonly STORAGE_KEY = 'admin-font-size';

  /** Font size as a percentage of the browser default. Range: 80–120, default: 100. */
  readonly size = signal<number>(this.load());

  constructor() {
    effect(() => {
      const value = this.size();
      document.documentElement.style.fontSize = value + '%';
      localStorage.setItem(this.STORAGE_KEY, String(value));
    });
  }

  private load(): number {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    return saved ? Number(saved) : 100;
  }
}
