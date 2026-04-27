import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-trip-request-hero',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule, NgOptimizedImage],
  templateUrl: './trip-request-hero.component.html',
  styleUrls: ['./trip-request-hero.component.scss'],
})
export class TripRequestHeroComponent {}
