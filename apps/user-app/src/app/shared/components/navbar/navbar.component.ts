import { Component, HostListener, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ButtonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  constructor(private router: Router, private cdr: ChangeDetectorRef) {
    // Re-run change detection on navigation so isActive() reflects the current URL
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      takeUntilDestroyed(),
    ).subscribe(() => this.cdr.markForCheck());
  }

  menuOpen = false;
  scrolled = false;

  @HostListener('window:scroll')
  onScroll(): void { this.scrolled = window.scrollY > 20; }

  toggleMenu(): void { this.menuOpen = !this.menuOpen; }
  closeMenu(): void { this.menuOpen = false; }

  navigateTo(path: string): void {
    this.router.navigate([path]);
    this.closeMenu();
  }

  isActive(path: string): boolean {
    return this.router.url === path || (path !== '/' && this.router.url.startsWith(path));
  }
}
