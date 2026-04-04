import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { Store } from '@ngrx/store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastModule } from 'primeng/toast';

import { selectTotalCount } from '@admin/core/store/notifications';

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, ToastModule],
  templateUrl: './app.component.html',
})
export class AppComponent {
  private readonly store = inject(Store);
  private readonly titleService = inject(Title);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.initTitleCounter();
  }

  private initTitleCounter(): void {
    this.store
      .select(selectTotalCount)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((count) => {
        this.titleService.setTitle(count > 0 ? `(${count}) Lilia Paws Admin` : 'Lilia Paws Admin');
      });
  }
}
