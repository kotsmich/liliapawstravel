import { Component, ChangeDetectionStrategy, inject, input, output } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { Dog } from '@models/lib/dog.model';
import { TripDogsTabsComponent } from '@admin/features/trips/components/trip-dogs-tabs/trip-dogs-tabs.component';
import { DogManagerService } from '../dog-manager.service';

@Component({
  selector: 'app-trip-dogs-manager',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule, TripDogsTabsComponent],
  templateUrl: './trip-dogs-manager.component.html',
  styleUrl: './trip-dogs-manager.component.scss',
})
export class TripDogsManagerComponent {
  readonly tripId = input<string | null>(null);
  readonly rowClicked = output<Dog>();
  readonly dogManager = inject(DogManagerService);
}
