import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, NavigationStart, NavigationCancel, NavigationError } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, map, startWith, switchMap } from 'rxjs';
import { ToastModule } from 'primeng/toast';
import { ProgressBarModule } from 'primeng/progressbar';
import { TranslocoService } from '@jsverse/transloco';

import { Store } from '@ngrx/store';
import { NavbarComponent } from '@user/shared/components/navbar/navbar.component';
import { FooterComponent } from '@user/shared/components/footer/footer.component';
import { AppWebSocketService } from '@ui/lib/websocket/app-websocket.service';
import { RouterUrlService } from '@user/services/router-url.service';
import { SeoService } from '@user/services/seo.service';
import { LoggerService } from '@user/services/logger.service';
import { DEFAULT_LANG, SupportedLang, isSupportedLang, stripLangPrefix } from '@user/core/i18n/supported-langs';
import imageDimensions from '../assets/images/dimensions.json';

const ROUTE_TO_SEO_KEY: Record<string, string> = {
  '/': 'home',
  '/contact': 'contact',
  '/request': 'request',
  '/faq': 'faq',
  '/about': 'about',
  '/results': 'results',
  '/transport-documents': 'transportDocuments',
};

// Routes whose children are dynamic (e.g. /results/:id) and share the parent's SEO
// entry — without this they fall through to the wildcard branch and get the 404 title.
const DYNAMIC_CHILD_PREFIXES = ['/results'];

// Per-route share-card image (filename in /assets/images/). Routes without an
// entry fall back to the global /assets/og-image.jpg in SeoService.
const ROUTE_TO_OG_IMAGE: Record<string, string | undefined> = {
  home: 'hero-2.webp',
  about: 'founder.webp',
  request: 'request-hero.webp',
  contact: 'contact-hero.webp',
  faq: undefined,
  transportDocuments: 'cta-bg.webp',
};

type ImageDimensions = Record<string, { width: number; height: number }>;
const DIMENSIONS = imageDimensions as ImageDimensions;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ToastModule, ProgressBarModule],
  template: `
    <p-toast position="top-right"></p-toast>
    @if (navigating()) {
      <p-progressBar mode="indeterminate" styleClass="route-loader" [style]="{ height: '3px' }" />
    }
    <app-navbar></app-navbar>
    <main id="main-content"><router-outlet></router-outlet></main>
    <app-footer></app-footer>
  `,
  styles: [`
    main { min-height: calc(100vh - 70px); padding-top: 70px; }
    :host ::ng-deep .route-loader { position: fixed; top: 0; left: 0; width: 100%; z-index: 9999; border-radius: 0; }
  `],
})
export class AppComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);
  private readonly currentUrl = inject(RouterUrlService).currentUrl;
  private readonly seo = inject(SeoService);
  private readonly logger = inject(LoggerService);

  readonly navigating = signal(false);

  constructor(
    private readonly store: Store,
    private readonly wsService: AppWebSocketService,
    private readonly router: Router,
    private readonly translocoService: TranslocoService,
  ) {
    this.router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
      if (event instanceof NavigationStart)                               this.navigating.set(true);
      if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) this.navigating.set(false);
    });
    this.initDynamicTitles();
  }

  ngOnInit(): void {
    this.wsService.connect();
  }

  private initDynamicTitles(): void {
    const lang$ = this.translocoService.langChanges$.pipe(
      startWith(this.translocoService.getActiveLang()),
    );
    const url$ = toObservable(this.currentUrl);

    combineLatest([lang$, url$])
      .pipe(
        switchMap(([lang, url]) =>
          this.translocoService.load(lang).pipe(map(() => ({ lang, url }))),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ lang, url }) => {
        this.document.documentElement.setAttribute('lang', lang);
        this.updateMeta(url, lang);
      });
  }

  private updateMeta(url: string, lang: string): void {
    const path = stripLangPrefix(url.split('?')[0].split('#')[0]);
    const seoLang: SupportedLang = isSupportedLang(lang) ? lang : DEFAULT_LANG;
    const dynamicParent = DYNAMIC_CHILD_PREFIXES.find((prefix) => path.startsWith(`${prefix}/`));
    const seoKey = ROUTE_TO_SEO_KEY[path] ?? (dynamicParent ? ROUTE_TO_SEO_KEY[dynamicParent] : undefined);

    // Unknown path = wildcard 404 route. Apply the noindex SEO so this NavigationEnd
    // pass agrees with NotFoundComponent.ngOnInit and doesn't reset robots to index.
    if (!seoKey) {
      this.seo.apply({
        title: this.translocoService.translate('seo.notFound.title', undefined, seoLang),
        description: this.translocoService.translate('seo.notFound.description', undefined, seoLang),
        path: '/404',
        lang: seoLang,
        robots: 'noindex, follow',
      });
      return;
    }

    const imageFile = ROUTE_TO_OG_IMAGE[seoKey];
    const dims = imageFile ? DIMENSIONS[imageFile] : undefined;
    const altKey = `seo.${seoKey}.imageAlt`;
    const altTranslated = this.translocoService.translate(altKey, undefined, seoLang);
    // Home gets no BreadcrumbList — single-item breadcrumbs offer no SERP value.
    const breadcrumbName = seoKey === 'home'
      ? undefined
      : this.translocoService.translate(`seo.${seoKey}.breadcrumb`, undefined, seoLang);
    this.seo.apply({
      title: this.translocoService.translate(`seo.${seoKey}.title`, undefined, seoLang),
      description: this.translocoService.translate(`seo.${seoKey}.description`, undefined, seoLang),
      path,
      lang: seoLang,
      image: imageFile ? `/assets/images/${imageFile}` : undefined,
      imageAlt: altTranslated && altTranslated !== altKey ? altTranslated : undefined,
      imageWidth: dims?.width,
      imageHeight: dims?.height,
      breadcrumbName,
    });
  }
}
