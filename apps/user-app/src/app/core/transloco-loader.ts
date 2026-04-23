import { inject, Injectable } from '@angular/core';
import { Translation, TranslocoLoader } from '@jsverse/transloco';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  private http = inject(HttpClient);

  getTranslation(lang: string) {
    const safeLang = lang || 'en';
    const v = environment.i18nVersion;
    const url = v ? `/assets/i18n/${safeLang}.json?v=${v}` : `/assets/i18n/${safeLang}.json`;
    return this.http.get<Translation>(url);
  }
}
