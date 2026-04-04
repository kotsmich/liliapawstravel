import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, NavigationStart, NavigationCancel, NavigationError } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, combineLatest, EMPTY } from 'rxjs';
import { filter, map, startWith } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ProgressBarModule } from 'primeng/progressbar';
import { TranslocoService } from '@jsverse/transloco';

import { Store } from '@ngrx/store';
import { NavbarComponent } from '@user/shared/components/navbar/navbar.component';
import { FooterComponent } from '@user/shared/components/footer/footer.component';
import { AppWebSocketService } from '@ui/lib/websocket/app-websocket.service';
import { SocketEvent } from '@models/lib/socket-events.model';
import { TripRequest } from '@models/lib/trip-request.model';
import { refreshTrips } from '@user/core/store/trips';

const BASE_URL = 'https://liliapawstravel.com';

interface RouteMeta {
  title: string;
  description: string;
  canonical: string;
}

const ROUTE_META: Record<string, Record<string, RouteMeta>> = {
  en: {
    '/': {
      title: 'Lilia Paws Travel — Safe Dog Transport Across Europe',
      description: 'Lilia Paws Travel safely transports adopted dogs across Europe, connecting shelters with loving families. Request transport for your rescue dog today.',
      canonical: `${BASE_URL}/`,
    },
    '/contact': {
      title: 'Contact Us — Lilia Paws Travel',
      description: 'Get in touch with Lilia Paws Travel. We answer questions about dog transport across Europe and help you schedule your rescue dog\'s journey.',
      canonical: `${BASE_URL}/contact`,
    },
    '/request': {
      title: 'Request Dog Transport — Lilia Paws Travel',
      description: 'Submit a transport request for your rescue dog. Lilia Paws Travel connects adoptive families with safe, reliable cross-Europe dog transport.',
      canonical: `${BASE_URL}/request`,
    },
  },
  el: {
    '/': {
      title: 'Lilia Paws Travel — Ασφαλής Μεταφορά Σκύλων στην Ευρώπη',
      description: 'Η Lilia Paws Travel μεταφέρει με ασφάλεια υιοθετημένους σκύλους σε όλη την Ευρώπη, συνδέοντας καταφύγια με αγαπημένες οικογένειες. Ζητήστε μεταφορά για τον σκύλο σας σήμερα.',
      canonical: `${BASE_URL}/`,
    },
    '/contact': {
      title: 'Επικοινωνία — Lilia Paws Travel',
      description: 'Επικοινωνήστε με την Lilia Paws Travel. Απαντάμε σε ερωτήσεις για τη μεταφορά σκύλων στην Ευρώπη και σας βοηθάμε να προγραμματίσετε το ταξίδι του σκύλου σας.',
      canonical: `${BASE_URL}/contact`,
    },
    '/request': {
      title: 'Αίτηση Μεταφοράς Σκύλου — Lilia Paws Travel',
      description: 'Υποβάλετε αίτημα μεταφοράς για τον υιοθετημένο σκύλο σας. Η Lilia Paws Travel συνδέει οικογένειες με ασφαλή και αξιόπιστη μεταφορά σε όλη την Ευρώπη.',
      canonical: `${BASE_URL}/request`,
    },
  },
  de: {
    '/': {
      title: 'Lilia Paws Travel — Sicherer Hundetransport durch Europa',
      description: 'Lilia Paws Travel transportiert adoptierte Hunde sicher durch Europa und verbindet Tierheime mit liebevollen Familien. Beantragen Sie noch heute den Transport für Ihren Rettungshund.',
      canonical: `${BASE_URL}/`,
    },
    '/contact': {
      title: 'Kontakt — Lilia Paws Travel',
      description: 'Nehmen Sie Kontakt mit Lilia Paws Travel auf. Wir beantworten Fragen zum Hundetransport durch Europa und helfen Ihnen, die Reise Ihres Rettungshundes zu planen.',
      canonical: `${BASE_URL}/contact`,
    },
    '/request': {
      title: 'Hundetransport anfragen — Lilia Paws Travel',
      description: 'Stellen Sie einen Transportantrag für Ihren Rettungshund. Lilia Paws Travel verbindet Adoptiveltern mit sicherem und zuverlässigem Hundetransport durch ganz Europa.',
      canonical: `${BASE_URL}/request`,
    },
  },
};

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
    <main id="main-content" aria-live="polite"><router-outlet></router-outlet></main>
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

  readonly navigating = signal(false);

  constructor(
    private readonly store: Store,
    private readonly wsService: AppWebSocketService,
    private readonly messageService: MessageService,
    private readonly router: Router,
    private readonly titleService: Title,
    private readonly metaService: Meta,
    private readonly translocoService: TranslocoService,
  ) {
    this.router.events.pipe(takeUntilDestroyed()).subscribe((e) => {
      if (e instanceof NavigationStart)                               this.navigating.set(true);
      if (e instanceof NavigationEnd || e instanceof NavigationCancel || e instanceof NavigationError) this.navigating.set(false);
    });
  }

  ngOnInit(): void {
    this.store.dispatch(refreshTrips());
    this.wsService.connect();
    this.initDynamicTitles();

    this.wsService
      .listen<TripRequest>(SocketEvent.REQUEST_UPDATED)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((err) => { console.error('WS REQUEST_UPDATED error', err); return EMPTY; }),
      )
      .subscribe((request) => {
        if (request.status === 'approved') {
          this.messageService.add({
            severity: 'success',
            summary: 'Request Approved',
            detail: 'Your trip request has been approved!',
            life: 6000,
          });
        } else if (request.status === 'rejected') {
          this.messageService.add({
            severity: 'warn',
            summary: 'Request Update',
            detail: 'Your request was not accepted.',
            life: 6000,
          });
        }
      });
  }

  private initDynamicTitles(): void {
    combineLatest([
      this.router.events.pipe(
        filter((e) => e instanceof NavigationEnd),
        map((e) => (e as NavigationEnd).urlAfterRedirects || (e as NavigationEnd).url),
        startWith(this.router.url),
      ),
      this.translocoService.langChanges$.pipe(startWith(this.translocoService.getActiveLang())),
    ])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([url, lang]) => {
        this.document.documentElement.setAttribute('lang', lang);
        this.updateMeta(url, lang);
      });
  }

  private updateMeta(url: string, lang: string): void {
    const langMeta = ROUTE_META[lang] ?? ROUTE_META['en'];
    const meta = langMeta[url] ?? langMeta['/'];

    this.titleService.setTitle(meta.title);

    this.metaService.updateTag({ name: 'description', content: meta.description });
    this.metaService.updateTag({ property: 'og:title', content: meta.title });
    this.metaService.updateTag({ property: 'og:description', content: meta.description });
    this.metaService.updateTag({ property: 'og:url', content: meta.canonical });
    this.metaService.updateTag({ name: 'twitter:title', content: meta.title });
    this.metaService.updateTag({ name: 'twitter:description', content: meta.description });

    const canonicalEl = this.document.querySelector('link[rel="canonical"]');
    if (canonicalEl) canonicalEl.setAttribute('href', meta.canonical);
  }
}
