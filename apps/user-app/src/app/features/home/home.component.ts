import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HeroComponent } from './components/hero/hero.component';
import { AboutSectionComponent } from './components/about-section/about-section.component';
import { CtaSectionComponent } from './components/cta-section/cta-section.component';
import { PanoramaSectionComponent } from './components/panorama-section/panorama-section.component';

@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HeroComponent, AboutSectionComponent, CtaSectionComponent, PanoramaSectionComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  private readonly router = inject(Router);

  steps = [
    { step: 1, title: 'about.step1.title', desc: 'about.step1.desc' },
    { step: 2, title: 'about.step2.title', desc: 'about.step2.desc' },
    { step: 3, title: 'about.step3.title', desc: 'about.step3.desc' },
    { step: 4, title: 'about.step4.title', desc: 'about.step4.desc' },
  ];

  goToRequest(): void { this.router.navigate(['/request']); }
  goToContact(): void { this.router.navigate(['/contact']); }
}
