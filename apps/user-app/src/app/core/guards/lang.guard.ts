import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { DEFAULT_LANG, isSupportedLang } from '../i18n/supported-langs';

export const langGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const router = inject(Router);
  const transloco = inject(TranslocoService);
  const lang = route.params['lang'] as string | undefined;

  if (!isSupportedLang(lang)) {
    const rest = state.url.replace(/^\/[^/]+/, '') || '';
    return router.parseUrl(`/${DEFAULT_LANG}${rest}`);
  }

  if (transloco.getActiveLang() !== lang) {
    transloco.setActiveLang(lang);
  }
  return true;
};
