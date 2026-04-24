import { inject, Injectable, isDevMode } from '@angular/core';
import { Translation, TranslocoLoader } from '@jsverse/transloco';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  private http = inject(HttpClient);

  getTranslation(lang: string) {
    const safeLang = lang || 'en';
    const url = isDevMode()
      ? `/assets/i18n/${safeLang}.json?v=${Date.now()}`
      : `/assets/i18n/${safeLang}.json`;
    return this.http.get<Translation>(url);
  }
}
