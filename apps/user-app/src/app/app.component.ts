import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { NavbarComponent } from '@user/shared/components/navbar/navbar.component';
import { FooterComponent } from '@user/shared/components/footer/footer.component';
import { AppWebSocketService } from '@ui/lib/websocket/app-websocket.service';
import { SocketEvent } from '@models/lib/socket-events.model';
import { TripRequest } from '@models/lib/trip-request.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ToastModule],
  template: `
    <p-toast position="top-right"></p-toast>
    <app-navbar></app-navbar>
    <main><router-outlet></router-outlet></main>
    <app-footer></app-footer>
  `,
  styles: [`main { min-height: calc(100vh - 70px); }`],
})
export class AppComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly wsService: AppWebSocketService,
    private readonly messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.wsService.connect();

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
}
