import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [SkeletonModule, ProgressSpinnerModule],
  templateUrl: './loading-overlay.component.html',
  styleUrl: './loading-overlay.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingOverlayComponent {
  readonly loading = input(false);
  readonly rows = input(5);
  readonly type = input<'spinner' | 'skeleton'>('skeleton');

  readonly rowsArray = computed(() => Array.from({ length: this.rows() }, (_, i) => i));
}
