import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { AvatarModule } from 'primeng/avatar';
import { Store } from '@ngrx/store';
import { AuthActions, selectCurrentUser, TripRequestActions, selectPendingRequestsCount } from '@myorg/store';
import { AdminUser } from '@myorg/models';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ButtonModule, TooltipModule, AvatarModule],
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
})
export class ShellComponent implements OnInit {
  constructor(private store: Store, private router: Router) {}

  user$ = this.store.select(selectCurrentUser) as import('rxjs').Observable<AdminUser | null>;
  pendingCount$ = this.store.select(selectPendingRequestsCount);
  sidebarOpen = true;

  ngOnInit(): void {
    this.store.dispatch(TripRequestActions.loadRequests());
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  isActive(link: string): boolean {
    return this.router.url === link || this.router.url.startsWith(link + '/');
  }

  navItems = [
    { icon: 'pi pi-th-large', label: 'Dashboard', link: '/admin/dashboard' },
    { icon: 'pi pi-car', label: 'Trips', link: '/admin/trips' },
    { icon: 'pi pi-inbox', label: 'Requests', link: '/admin/requests' },
  ];
}
