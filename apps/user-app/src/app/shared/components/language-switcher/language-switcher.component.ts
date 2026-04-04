import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';

interface LangOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SelectButtonModule, FormsModule],
  template: `
    <p-selectbutton
      [options]="langs"
      [(ngModel)]="activeLang"
      optionLabel="label"
      optionValue="value"
      (ngModelChange)="changeLang($event)"
    />
  `,
})
export class LanguageSwitcherComponent {
  private readonly transloco = inject(TranslocoService);

  langs: LangOption[] = [
    { label: 'EN', value: 'en' },
    { label: 'ΕΛ', value: 'el' },
    { label: 'DE', value: 'de' },
  ];

  activeLang = this.transloco.getActiveLang() ?? 'en';

  changeLang(lang: string): void {
    this.transloco.setActiveLang(lang);
  }
}
