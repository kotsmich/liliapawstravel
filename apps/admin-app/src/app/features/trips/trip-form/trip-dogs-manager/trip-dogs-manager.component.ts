import { Component, ChangeDetectionStrategy, inject, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';
import { TranslocoModule } from '@jsverse/transloco';
import { Dog } from '@models/lib/dog.model';
import { DogsTableComponent } from '@admin/features/trips/components/dogs-table.component';
import { DogsByRequestorComponent } from '@admin/features/trips/components/dogs-by-requestor/dogs-by-requestor.component';
import { DogFormDialogWrapperComponent } from '@admin/features/trips/components/dog-form-dialog-wrapper/dog-form-dialog-wrapper.component';
import { DogManagerService } from '../dog-manager.service';

/**
 * Dogs management card extracted from trip-form.component.html (lines 129–176).
 * Owns: tab state, selection action buttons, dogs/requestor tables, and dog-form dialog.
 * Emits rowClicked so the parent can open the read-only dog detail dialog.
 */
@Component({
  selector: 'app-trip-dogs-manager',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonModule, TabsModule, TranslocoModule,
    DogsTableComponent, DogsByRequestorComponent,
    DogFormDialogWrapperComponent,
  ],
  templateUrl: './trip-dogs-manager.component.html',
  styleUrl: './trip-dogs-manager.component.scss',
})
export class TripDogsManagerComponent {
  /** Pass the trip ID so the dialog wrapper can dispatch server-side mutations. */
  readonly tripId = input<string | null>(null);

  readonly rowClicked = output<Dog>();

  readonly dogManager = inject(DogManagerService);

  activeDogsTab = 'all';

  onTabChange(): void {
    this.dogManager.clearGroupSelections();
  }
}
