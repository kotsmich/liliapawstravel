import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { TranslocoService } from '@jsverse/transloco';
import { environment } from '../../environments/environment';
import { DEFAULT_LANG, SUPPORTED_LANGS, SupportedLang } from '@user/core/i18n/supported-langs';
import { JsonLdService } from './json-ld.service';

const FALLBACK_IMAGE = '/assets/og-image.jpg';
const BREADCRUMB_JSONLD_ID = 'breadcrumb';

export interface SeoMeta {
  title: string;
  description: string;
  /** Path WITHOUT the language prefix (e.g. "/", "/about"). */
  path: string;
  lang: SupportedLang;
  /** Absolute URL or asset-relative path (e.g. "/assets/images/hero-2.webp"). */
  image?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  /** Override <meta name="robots">. Defaults to 'index, follow'. */
  robots?: string;
  /**
   * Translated label for the current page (e.g. "About"). When provided and
   * the path is not "/", a BreadcrumbList JSON-LD schema is emitted. Omit on
   * Home and noindex routes (404) to suppress the breadcrumb.
   */
  breadcrumbName?: string;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly document = inject(DOCUMENT);
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);
  private readonly jsonLd = inject(JsonLdService);
  private readonly transloco = inject(TranslocoService);

  apply(meta: SeoMeta): void {
    const { title, description, path, lang } = meta;
    const canonical = this.urlFor(lang, path);
    const image = this.absoluteImageUrl(meta.image);
    const imageAlt = meta.imageAlt ?? title;

    this.titleService.setTitle(title);
    this.metaService.updateTag({ name: 'description', content: description });
    this.metaService.updateTag({ name: 'robots', content: meta.robots ?? 'index, follow' });
    this.metaService.updateTag({ property: 'og:type', content: 'website' });
    this.metaService.updateTag({ property: 'og:site_name', content: 'Lilia Paws Travel' });
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: description });
    this.metaService.updateTag({ property: 'og:url', content: canonical });
    this.metaService.updateTag({ property: 'og:locale', content: this.ogLocale(lang) });
    this.metaService.updateTag({ property: 'og:image', content: image });
    this.metaService.updateTag({ property: 'og:image:alt', content: imageAlt });
    this.upsertDimension('og:image:width', meta.imageWidth);
    this.upsertDimension('og:image:height', meta.imageHeight);
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: title });
    this.metaService.updateTag({ name: 'twitter:description', content: description });
    this.metaService.updateTag({ name: 'twitter:image', content: image });
    this.metaService.updateTag({ name: 'twitter:image:alt', content: imageAlt });

    this.setCanonical(canonical);
    this.setAlternates(path);

    if (path === '/' || !meta.breadcrumbName) {
      this.jsonLd.clear(BREADCRUMB_JSONLD_ID);
    } else {
      this.jsonLd.set(BREADCRUMB_JSONLD_ID, this.buildBreadcrumb(meta));
    }
  }

  private buildBreadcrumb(meta: SeoMeta): object {
    const homeName = this.transloco.translate('seo.common.homeBreadcrumb', undefined, meta.lang);
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: homeName,
          item: this.urlFor(meta.lang, '/'),
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: meta.breadcrumbName,
          item: this.urlFor(meta.lang, meta.path),
        },
      ],
    };
  }

  private urlFor(lang: SupportedLang, path: string): string {
    const tail = !path || path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
    return `${environment.baseUrl}/${lang}${tail}`;
  }

  private absoluteImageUrl(image: string | undefined): string {
    const value = image ?? FALLBACK_IMAGE;
    if (/^https?:\/\//i.test(value)) return value;
    return `${environment.baseUrl}${value.startsWith('/') ? value : `/${value}`}`;
  }

  // og:image:width and og:image:height are only meaningful when both are
  // known. Remove the tag when undefined so we never emit a stale value
  // from a previous route.
  private upsertDimension(property: string, value: number | undefined): void {
    if (value && value > 0) {
      this.metaService.updateTag({ property, content: String(value) });
    } else {
      this.metaService.removeTag(`property="${property}"`);
    }
  }

  private ogLocale(lang: SupportedLang): string {
    switch (lang) {
      case 'el': return 'el_GR';
      case 'en': return 'en_GB';
      case 'de': return 'de_DE';
    }
  }

  private setCanonical(href: string): void {
    const head = this.document.head;
    let link = head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      head.appendChild(link);
    }
    link.setAttribute('href', href);
  }

  private setAlternates(path: string): void {
    const head = this.document.head;
    head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => el.remove());

    for (const lang of SUPPORTED_LANGS) {
      const link = this.document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', lang);
      link.setAttribute('href', this.urlFor(lang, path));
      head.appendChild(link);
    }
    const xDefault = this.document.createElement('link');
    xDefault.setAttribute('rel', 'alternate');
    xDefault.setAttribute('hreflang', 'x-default');
    xDefault.setAttribute('href', this.urlFor(DEFAULT_LANG, path));
    head.appendChild(xDefault);
  }
}
