import { Component, ChangeDetectionStrategy, input, computed, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-media-viewer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule],
  templateUrl: './media-viewer.component.html',
  styleUrl: './media-viewer.component.scss',
})
export class MediaViewerComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly url = input<string | null>(null);
  readonly noMediaIcon = input('pi-image');
  readonly noMediaLabel = input('');
  readonly frameHeight = input('380px');
  readonly imgMaxHeight = input('260px');

  readonly isPdf = computed(() =>
    (this.url() ?? '').toLowerCase().includes('.pdf'),
  );

  readonly safeUrl = computed((): SafeResourceUrl | null => {
    const url = this.url();
    if (!url || !this.isPdf()) return null;
    const clean = url.split('#')[0] + '#navpanes=0&toolbar=0&scrollbar=0';
    return this.sanitizer.bypassSecurityTrustResourceUrl(clean);
  });
}
