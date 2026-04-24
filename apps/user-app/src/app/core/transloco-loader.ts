import { Injectable } from '@angular/core';
import { Translation, TranslocoLoader } from '@jsverse/transloco';
import { of } from 'rxjs';
import en from '../../assets/i18n/en.json';
import el from '../../assets/i18n/el.json';
import de from '../../assets/i18n/de.json';

const TRANSLATIONS: Record<string, Translation> = {
  en: en as Translation,
  el: el as Translation,
  de: de as Translation,
};

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  getTranslation(lang: string) {
    return of(TRANSLATIONS[lang] ?? TRANSLATIONS['en']);
  }
}
