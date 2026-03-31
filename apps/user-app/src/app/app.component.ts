import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { NavbarComponent } from '@user/shared/components/navbar/navbar.component';
import { FooterComponent } from '@user/shared/components/footer/footer.component';
import { AppWebSocketService } from '@ui/lib/websocket/app-websocket.service';
import { SocketEvent } from '@models/lib/socket-events.model';
import { TripRequest } from '@models/lib/trip-request.model';

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Lilia Paws Travel — Safe Dog Transport Across Europe',
  '/contact': 'Contact Us — Lilia Paws Travel',
  '/request': 'Request Transport — Lilia Paws Travel',
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ToastModule],
  template: `
    <p-toast position="top-right"></p-toast>
    <app-navbar></app-navbar>
    <main id="main-content" aria-live="polite"><router-outlet></router-outlet></main>
    <app-footer></app-footer>
  `,
  styles: [`main { min-height: calc(100vh - 70px); }`],
})
export class AppComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly wsService: AppWebSocketService,
    private readonly messageService: MessageService,
    private readonly router: Router,
    private readonly titleService: Title,
  ) {}

  ngOnInit(): void {
    this.wsService.connect();
    this.initDynamicTitles();

    this.wsService
      .listen<TripRequest>(SocketEvent.REQUEST_UPDATED)
      .pipe(takeUntilDestroyed(this.destroyRef))
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
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((e) => {
        const url = (e as NavigationEnd).urlAfterRedirects || (e as NavigationEnd).url;
        const title = ROUTE_TITLES[url] ?? 'Lilia Paws Travel';
        this.titleService.setTitle(title);
      });
  }
}
