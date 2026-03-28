import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, CardModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
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
    { step: '01', title: 'Adopter Approved', desc: 'Shelter confirms the adoption.' },
    { step: '02', title: 'Book a Trip', desc: 'Submit the transport request.' },
    { step: '03', title: 'We Prepare', desc: 'Route planned, documents checked.' },
    { step: '04', title: 'Safe Delivery', desc: 'Your dog arrives happy and healthy.' },
  ];
}
