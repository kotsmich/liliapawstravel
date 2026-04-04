import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { TranslocoModule } from '@jsverse/transloco';
import { logout, selectCurrentUser } from '@admin/core/store/auth';
import { loadRequests, selectPendingRequestsCount } from '@admin/features/requests/store';
import { loadMessages, selectUnreadCount } from '@admin/features/messages/store';
import { AdminUser } from '@models/lib/admin-user.model';

@Component({
  selector: 'app-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, RouterOutlet, ButtonModule, TooltipModule, TranslocoModule],
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
})
export class ShellComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  user$: Observable<AdminUser | null> = this.store.select(selectCurrentUser);
  pendingCount$ = this.store.select(selectPendingRequestsCount);
  unreadMessagesCount$ = this.store.select(selectUnreadCount);

  ngOnInit(): void {
    this.store.dispatch(loadRequests());
    this.store.dispatch(loadMessages());
  }

  logout(): void {
    this.store.dispatch(logout());
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  isActive(link: string): boolean {
    return this.router.url === link || this.router.url.startsWith(link + '/');
  }

  navItems = [
    { icon: 'pi pi-th-large', labelKey: 'nav.dashboard', link: '/admin/dashboard' },
    { icon: 'pi pi-car', labelKey: 'nav.trips', link: '/admin/trips' },
    { icon: 'pi pi-inbox', labelKey: 'nav.requests', link: '/admin/requests' },
    { icon: 'pi pi-envelope', labelKey: 'nav.messages', link: '/admin/messages' },
  ];
}
