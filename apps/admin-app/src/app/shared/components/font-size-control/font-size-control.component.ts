import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';
import { TranslocoModule } from '@jsverse/transloco';
import { FontSizeService } from '@admin/services/font-size.service';

@Component({
  selector: 'app-font-size-control',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TooltipModule, TranslocoModule],
  templateUrl: './font-size-control.component.html',
  styleUrl: './font-size-control.component.scss',
})
export class FontSizeControlComponent {
  readonly fontSizeService = inject(FontSizeService);
  readonly fontPanelOpen = signal(false);

  toggleFontPanel(): void {
    this.fontPanelOpen.update(v => !v);
  }
}
