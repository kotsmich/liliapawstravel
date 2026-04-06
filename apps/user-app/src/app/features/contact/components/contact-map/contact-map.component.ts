import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-contact-map',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contact-map.component.html',
  styleUrls: ['./contact-map.component.scss'],
})
export class ContactMapComponent {}
