import { Component, ChangeDetectionStrategy } from '@angular/core';

import { Router } from '@angular/router';
import { HeroComponent } from './components/hero/hero.component';
import { StatsSectionComponent } from './components/stats-section/stats-section.component';
import { AboutSectionComponent } from './components/about-section/about-section.component';
import { CtaSectionComponent } from './components/cta-section/cta-section.component';

@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HeroComponent, StatsSectionComponent, AboutSectionComponent, CtaSectionComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  constructor(private router: Router) {}

  stats = [
    { value: '1,200+', label: 'Dogs Transported' },
    { value: '18', label: 'Countries' },
    { value: '6', label: 'Years Active' },
    { value: '99%', label: 'Safe Arrivals' },
  ];
  values = [
    { icon: '🛡️', title: 'Safety First', desc: 'Vet-approved health certificates and constant monitoring.' },
    { icon: '❤️', title: 'We Care Deeply', desc: 'Dogs are not cargo. Comfort stops and cuddles on every trip.' },
    { icon: '📋', title: 'Fully Legal', desc: 'EU pet travel compliance — microchips, passports, documents handled.' },
    { icon: '🤝', title: 'Shelter Partners', desc: 'We work with 200+ certified shelters and verified adopters.' },
  ];
  steps = [
    { step: 1, title: 'Adopter Approved', desc: 'Shelter confirms the adoption.' },
    { step: 2, title: 'Book a Trip', desc: 'Submit the transport request.' },
    { step: 3, title: 'We Prepare', desc: 'Route planned, documents checked.' },
    { step: 4, title: 'Safe Delivery', desc: 'Your dog arrives happy and healthy.' },
  ];

  goToRequest(): void { this.router.navigate(['/request']); }
  goToContact(): void { this.router.navigate(['/contact']); }
}
