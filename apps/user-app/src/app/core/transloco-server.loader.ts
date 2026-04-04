import { Injectable } from '@angular/core';
import { Translation, TranslocoLoader } from '@jsverse/transloco';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Observable, of } from 'rxjs';

@Injectable()
export class TranslocoServerLoader implements TranslocoLoader {
  getTranslation(lang: string): Observable<Translation> {
    const safeLang = lang || 'el';
    const candidates = [
      join(process.cwd(), `dist/apps/user-app/browser/assets/i18n/${safeLang}.json`),
      join(process.cwd(), `apps/user-app/src/assets/i18n/${safeLang}.json`),
    ];
    for (const filePath of candidates) {
      try {
        return of(JSON.parse(readFileSync(filePath, 'utf-8')) as Translation);
      } catch {
        // try next path
      }
    }
    return of({});
  }
}
