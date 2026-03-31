import { Component, OnInit, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { AvatarModule } from 'primeng/avatar';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { logout, selectCurrentUser } from '@admin/core/store/auth';
import { loadRequests, selectPendingRequestsCount } from '@admin/features/requests/store';
import { loadMessages, selectUnreadCount } from '@admin/features/messages/store';
import { AdminUser } from '@models/lib/admin-user.model';

@Component({
  selector: 'app-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterOutlet, ButtonModule, TooltipModule, AvatarModule],
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
})
export class ShellComponent implements OnInit {
  constructor(private store: Store, private router: Router) {}

  user$: Observable<AdminUser | null> = this.store.select(selectCurrentUser);
  pendingCount$ = this.store.select(selectPendingRequestsCount);
  unreadMessagesCount$ = this.store.select(selectUnreadCount);
  sidebarOpen = true;

  get isMobile(): boolean { return window.innerWidth < 768; }

  ngOnInit(): void {
    this.store.dispatch(loadRequests());
    this.store.dispatch(loadMessages());
    if (this.isMobile) this.sidebarOpen = false;
  }

  @HostListener('window:resize')
  onResize(): void {
    if (!this.isMobile && !this.sidebarOpen) this.sidebarOpen = true;
    if (this.isMobile && this.sidebarOpen) this.sidebarOpen = false;
  }

  logout(): void {
    this.store.dispatch(logout());
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
    if (this.isMobile) this.sidebarOpen = false;
  }

  isActive(link: string): boolean {
    return this.router.url === link || this.router.url.startsWith(link + '/');
  }

  navItems = [
    { icon: 'pi pi-th-large', label: 'Dashboard', link: '/admin/dashboard' },
    { icon: 'pi pi-car', label: 'Trips', link: '/admin/trips' },
    { icon: 'pi pi-inbox', label: 'Requests', link: '/admin/requests' },
    { icon: 'pi pi-envelope', label: 'Messages', link: '/admin/messages' },
  ];
}
