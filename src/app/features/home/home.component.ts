import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  stats = [
    { value: '1,200+', label: 'Dogs Transported' },
    { value: '18', label: 'Countries Covered' },
    { value: '6', label: 'Years of Service' },
    { value: '99%', label: 'Safe Arrivals' },
  ];

  values = [
    {
      icon: '🛡️',
      title: 'Safety First',
      desc: 'Every dog travels with a vet-approved health certificate and constant monitoring throughout the journey.',
    },
    {
      icon: '❤️',
      title: 'We Care Deeply',
      desc: 'Dogs are not cargo. We provide comfort stops, water, and cuddles on every single trip.',
    },
    {
      icon: '📋',
      title: 'Fully Legal',
      desc: 'All transports comply with EU pet travel regulations — microchips, passports, and border documentation handled.',
    },
    {
      icon: '🤝',
      title: 'Shelter Partners',
      desc: 'We work directly with certified shelters and verified adopters across the continent.',
    },
  ];

  steps = [
    { step: '01', title: 'Adopter Approved', desc: 'The shelter or rescue group confirms the adoption.' },
    { step: '02', title: 'Book a Trip', desc: 'You submit the transport request with dog details and route.' },
    { step: '03', title: 'We Prepare', desc: 'We plan the route, check all documentation, and prep the vehicle.' },
    { step: '04', title: 'Safe Delivery', desc: 'Your dog arrives at the destination — happy, healthy, and home.' },
  ];
}
