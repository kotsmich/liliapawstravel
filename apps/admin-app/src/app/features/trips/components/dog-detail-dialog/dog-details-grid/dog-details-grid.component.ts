import { Component, ChangeDetectionStrategy, inject, input } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { Dog, DogBehavior, DogHeight } from '@models/lib/dog.model';
import { DogRequester } from '@admin/features/trips/shared/dog-requester.model';

@Component({
  selector: 'app-dog-details-grid',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TagModule, TranslocoModule],
  templateUrl: './dog-details-grid.component.html',
  styleUrl: './dog-details-grid.component.scss',
})
export class DogDetailsGridComponent {
  readonly dog = input.required<Dog>();
  readonly requester = input<DogRequester | null>(null);

  private readonly transloco = inject(TranslocoService);

  sizeSeverity(size: Dog['size']): 'success' | 'warn' | 'danger' {
    if (size === 'small') return 'success';
    if (size === 'medium') return 'warn';
    return 'danger';
  }

  heightLabel(height: DogHeight | null | undefined): string {
    if (!height) return '—';
    const key = height === 'under10' ? 'heightUnder10'
      : height === '10to25' ? 'height10to25'
      : 'heightOver30';
    return this.transloco.translate(`dogs.fields.${key}`);
  }

  behaviorsLabel(behaviors: DogBehavior[] | null | undefined): string {
    if (!behaviors?.length) return '—';
    return behaviors
      .map(b => this.transloco.translate(`dogs.fields.behavior${b.charAt(0).toUpperCase()}${b.slice(1)}`))
      .join(', ');
  }
}
