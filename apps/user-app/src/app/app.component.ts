import { Component, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, NavigationStart, NavigationCancel, NavigationError } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { catchError, EMPTY } from 'rxjs';
import { ToastModule } from 'primeng/toast';
import { ProgressBarModule } from 'primeng/progressbar';
import { TranslocoService } from '@jsverse/transloco';

import { Store } from '@ngrx/store';
import { NavbarComponent } from '@user/shared/components/navbar/navbar.component';
import { FooterComponent } from '@user/shared/components/footer/footer.component';
import { AppWebSocketService } from '@ui/lib/websocket/app-websocket.service';
import { SocketEvent } from '@models/lib/socket-events.model';
import { TripRequest } from '@models/lib/trip-request.model';
import { wsRequestApproved, wsRequestRejected } from '@user/core/toast/toast.actions';
import { RouterUrlService } from '@user/services/router-url.service';
import { SeoService } from '@user/services/seo.service';
import { LoggerService } from '@user/services/logger.service';

const ROUTE_TO_SEO_KEY: Record<string, string> = {
  '/': 'home',
  '/contact': 'contact',
  '/request': 'request',
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

    this.wsService
      .listen<TripRequest>(SocketEvent.REQUEST_UPDATED)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((err) => { this.logger.error('WS REQUEST_UPDATED error', err); return EMPTY; }),
      )
      .subscribe((request) => {
        if (request.status === 'approved') {
          this.store.dispatch(wsRequestApproved());
        } else if (request.status === 'rejected') {
          this.store.dispatch(wsRequestRejected());
        }
      });
  }

  private initDynamicTitles(): void {
    const lang = toSignal(this.translocoService.langChanges$, {
      initialValue: this.translocoService.getActiveLang(),
    });
    effect(() => {
      const activeLang = lang();
      this.document.documentElement.setAttribute('lang', activeLang);
      this.updateMeta(this.currentUrl(), activeLang);
    });
  }

  private updateMeta(url: string, lang: string): void {
    const seoKey = ROUTE_TO_SEO_KEY[url] ?? 'home';
    this.seo.apply({
      title: this.translocoService.translate(`seo.${seoKey}.title`, undefined, lang),
      description: this.translocoService.translate(`seo.${seoKey}.description`, undefined, lang),
      url,
    });
  }
}
