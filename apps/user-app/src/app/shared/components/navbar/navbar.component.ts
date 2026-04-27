import { Component, HostListener, ChangeDetectionStrategy, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TranslocoModule } from '@jsverse/transloco';
import { LanguageSwitcherComponent } from '@user/shared/components/language-switcher/language-switcher.component';
import { RouterUrlService } from '@user/services/router-url.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, ButtonModule, TranslocoModule, LanguageSwitcherComponent],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly currentUrl = inject(RouterUrlService).currentUrl;

  readonly menuOpen = signal(false);
  readonly scrolled = signal(false);

  @HostListener('window:scroll')
  onScroll(): void {
    if (isPlatformBrowser(this.platformId)) this.scrolled.set(window.scrollY > 20);
  }

  toggleMenu(): void { this.menuOpen.update(v => !v); }
  closeMenu(): void { this.menuOpen.set(false); }

  navigateTo(path: string): void {
    this.router.navigate([path]);
    this.closeMenu();
  }

  isActive(path: string): boolean {
    const url = this.currentUrl();
    return url === path || (path !== '/' && url.startsWith(path));
  }
}
