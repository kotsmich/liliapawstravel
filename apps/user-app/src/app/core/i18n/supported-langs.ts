export const SUPPORTED_LANGS = ['el', 'en', 'de'] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];
export const DEFAULT_LANG: SupportedLang = 'el';

export function isSupportedLang(value: string | null | undefined): value is SupportedLang {
  return !!value && (SUPPORTED_LANGS as readonly string[]).includes(value);
}

export function langFromPath(pathname: string | null | undefined): SupportedLang {
  const seg = pathname?.split('/').filter(Boolean)[0] ?? '';
  return isSupportedLang(seg) ? seg : DEFAULT_LANG;
}

export function stripLangPrefix(pathname: string): string {
  const match = pathname.match(/^\/(el|en|de)(\/.*)?$/);
  if (!match) return pathname;
  return match[2] || '/';
}
