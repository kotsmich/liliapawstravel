import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { TranslocoModule } from '@jsverse/transloco';
import { Dog } from '@models/lib/dog.model';

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

  sizeSeverity(size: Dog['size']): 'success' | 'warn' | 'danger' {
    if (size === 'small') return 'success';
    if (size === 'medium') return 'warn';
    return 'danger';
  }
}
