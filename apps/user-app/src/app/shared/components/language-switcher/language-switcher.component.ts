import { Component, ChangeDetectionStrategy, inject, ViewChild } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { PopoverModule } from 'primeng/popover';
import { Popover } from 'primeng/popover';

interface LangOption {
  code: string;
  value: string;
  label: string;
}

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonModule, PopoverModule],
  template: `
    <button class="lang-trigger" type="button" (click)="op.toggle($event)" [attr.aria-label]="'Language selector'">
      <span class="fi" [class]="'fi fi-' + activeCode"></span>
      <i class="pi pi-angle-down lang-trigger__caret"></i>
    </button>

    <p-popover #op styleClass="lang-popover">
      <div class="lang-options">
        @for (lang of langs; track lang.value) {
          <button
            class="lang-option"
            [class.active]="activeLang === lang.value"
            type="button"
            (click)="changeLang(lang.value); op.hide()"
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
  @ViewChild('op') op!: Popover;

  private readonly transloco = inject(TranslocoService);

  langs: LangOption[] = [
    { code: 'gb', value: 'en', label: 'English' },
    { code: 'gr', value: 'el', label: 'Ελληνικά' },
    { code: 'de', value: 'de', label: 'Deutsch' },
  ];

  activeLang = this.transloco.getActiveLang() ?? 'en';

  get activeCode(): string {
    return this.langs.find(l => l.value === this.activeLang)?.code ?? 'gb';
  }

  changeLang(lang: string): void {
    this.activeLang = lang;
    this.transloco.setActiveLang(lang);
  }
}
