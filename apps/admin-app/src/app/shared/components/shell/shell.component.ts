import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { AvatarModule } from 'primeng/avatar';
import { Store } from '@ngrx/store';
import { AuthActions, selectCurrentUser } from '@myorg/store';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ButtonModule, TooltipModule, AvatarModule],
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
})
export class ShellComponent {
  private store = inject(Store);
  user$ = this.store.select(selectCurrentUser);
  sidebarOpen = true;

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  navItems = [
    { icon: 'pi pi-th-large', label: 'Dashboard', link: '/admin/dashboard' },
    { icon: 'pi pi-car', label: 'Trips', link: '/admin/trips' },
  ];
}
