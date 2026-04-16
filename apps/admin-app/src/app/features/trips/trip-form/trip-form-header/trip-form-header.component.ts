import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TranslocoModule } from '@jsverse/transloco';

/**
 * Page header extracted from trip-form.component.html (lines 1–16).
 * Contains the back button, page title, and cancel/save action bar.
 */
@Component({
  selector: 'app-trip-form-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonModule, TranslocoModule],
  templateUrl: './trip-form-header.component.html',
  styleUrl: './trip-form-header.component.scss',
})
export class TripFormHeaderComponent {
  readonly title = input.required<string>();
  readonly saveLabel = input.required<string>();
  readonly isSaving = input<boolean>(false);

  readonly cancel = output<void>();
  readonly save = output<void>();
}
