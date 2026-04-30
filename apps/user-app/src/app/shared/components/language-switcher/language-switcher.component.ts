import { Component, ChangeDetectionStrategy, PLATFORM_ID, ViewChild, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { PopoverModule } from 'primeng/popover';
import { Popover } from 'primeng/popover';
import { DEFAULT_LANG, SUPPORTED_LANGS, SupportedLang, isSupportedLang } from '@user/core/i18n/supported-langs';

interface LangOption {
  code: string;
  value: SupportedLang;
  label: string;
}

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonModule, PopoverModule],
  template: `
    <button class="lang-trigger" type="button" (click)="popover.toggle($event)" [attr.aria-label]="'Language selector'">
      <span class="fi" [class]="'fi fi-' + activeCode"></span>
      <i class="pi pi-angle-down lang-trigger__caret"></i>
    </button>

    <p-popover #popover styleClass="lang-popover">
      <div class="lang-options">
        @for (lang of langs; track lang.value) {
          <button
            class="lang-option"
            [class.active]="activeLang === lang.value"
            type="button"
            (click)="changeLang(lang.value); popover.hide()"
            [attr.aria-label]="lang.label"
          >
            <span class="fi" [class]="'fi fi-' + lang.code"></span>
          </button>
        }
      </div>
    </p-popover>
  `,
  styles: [`
    .lang-trigger {
      display: flex;
      align-items: center;
      gap: 0.2rem;
      background: none;
      border: 1.5px solid transparent;
      border-radius: 8px;
      cursor: pointer;
      padding: 0.3rem 0.45rem;
      transition: border-color 0.2s, background 0.2s;
      font-family: inherit;
      &:hover {
        border-color: #e0dbd4;
        background: rgba(0,0,0,0.03);
      }
      .fi { width: 1.5em; height: 1.1em; font-size: 1.2rem; border-radius: 3px; }
      &__caret { font-size: 0.65rem; color: #8a8078; margin-top: 1px; }
    }

    .lang-options {
      display: flex;
      flex-direction: row;
      gap: 0.25rem;
      padding: 0.1rem;
    }

    .lang-option {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.3rem;
      border: 2px solid transparent;
      border-radius: 8px;
      background: none;
      cursor: pointer;
      transition: background 0.15s, border-color 0.15s;
      opacity: 0.55;

      &:hover { background: #f5f0ea; opacity: 0.85; }
      &.active {
        border-color: #eb691c;
        opacity: 1;
      }

      .fi { width: 1.75em; height: 1.25em; font-size: 1.3rem; border-radius: 3px; }
    }
  `],
})
export class LanguageSwitcherComponent {
  @ViewChild('popover') popover!: Popover;

  private readonly transloco = inject(TranslocoService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  readonly langs: LangOption[] = [
    { code: 'gb', value: 'en', label: 'English' },
    { code: 'gr', value: 'el', label: 'Ελληνικά' },
    { code: 'de', value: 'de', label: 'Deutsch' },
  ];

  get activeLang(): SupportedLang {
    const v = this.transloco.getActiveLang();
    return isSupportedLang(v) ? v : DEFAULT_LANG;
  }

  get activeCode(): string {
    return this.langs.find((lang) => lang.value === this.activeLang)?.code ?? 'gr';
  }

  changeLang(lang: SupportedLang): void {
    if (lang === this.activeLang) return;

    const currentUrl = this.router.url;
    const segments = currentUrl.split('?')[0].split('#')[0].split('/').filter(Boolean);
    if (segments.length && (SUPPORTED_LANGS as readonly string[]).includes(segments[0])) {
      segments[0] = lang;
    } else {
      segments.unshift(lang);
    }
    const queryIdx = currentUrl.indexOf('?');
    const fragmentIdx = currentUrl.indexOf('#');
    const queryParams = queryIdx >= 0
      ? Object.fromEntries(new URLSearchParams(currentUrl.slice(queryIdx + 1, fragmentIdx >= 0 ? fragmentIdx : undefined)))
      : undefined;
    const fragment = fragmentIdx >= 0 ? currentUrl.slice(fragmentIdx + 1) : undefined;

    if (isPlatformBrowser(this.platformId)) {
      // Persist for one year, root path, SameSite=Lax for safe top-level navigation.
      document.cookie = `lang=${lang}; Max-Age=31536000; Path=/; SameSite=Lax`;
    }

    this.router.navigate(['/', ...segments], { queryParams, fragment });
  }
}
