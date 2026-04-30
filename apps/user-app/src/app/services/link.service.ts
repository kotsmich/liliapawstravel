import { Injectable, Signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoService } from '@jsverse/transloco';
import { startWith } from 'rxjs/operators';
import { DEFAULT_LANG, SupportedLang, isSupportedLang } from '@user/core/i18n/supported-langs';

@Injectable({ providedIn: 'root' })
export class LinkService {
  private readonly transloco = inject(TranslocoService);

  readonly currentLang: Signal<SupportedLang> = toSignal(
    this.transloco.langChanges$.pipe(startWith<string>(this.transloco.getActiveLang())),
    { initialValue: this.transloco.getActiveLang() as SupportedLang },
  ) as Signal<SupportedLang>;

  /** Build a router commands array prefixed with the current language. */
  commands(path: string): unknown[] {
    const lang = this.lang();
    if (!path || path === '/') return ['/', lang];
    const segs = path.split('/').filter(Boolean);
    return ['/', lang, ...segs];
  }

  /** Build an absolute path string prefixed with the current language. */
  link(path: string): string {
    const lang = this.lang();
    if (!path || path === '/') return `/${lang}`;
    const clean = path.startsWith('/') ? path : `/${path}`;
    return `/${lang}${clean}`;
  }

  private lang(): SupportedLang {
    const value = this.currentLang();
    return isSupportedLang(value) ? value : DEFAULT_LANG;
  }
}
