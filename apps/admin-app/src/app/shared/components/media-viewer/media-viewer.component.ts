import { Component, ChangeDetectionStrategy, input, computed, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslocoModule } from '@jsverse/transloco';

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

function extOf(url: string): string {
  const path = url.split('#')[0].split('?')[0].toLowerCase();
  const dot = path.lastIndexOf('.');
  return dot >= 0 ? path.slice(dot) : '';
}

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

  readonly isPdf = computed(() => extOf(this.url() ?? '') === '.pdf');
  readonly isImage = computed(() => IMAGE_EXTENSIONS.includes(extOf(this.url() ?? '')));
  readonly isDownloadOnly = computed(() => !!this.url() && !this.isPdf() && !this.isImage());

  readonly fileName = computed(() => {
    const url = this.url();
    if (!url) return '';
    const path = url.split('#')[0].split('?')[0];
    return decodeURIComponent(path.split('/').pop() ?? '');
  });

  readonly safeUrl = computed((): SafeResourceUrl | null => {
    const url = this.url();
    if (!url || !this.isPdf()) return null;
    const clean = url.split('#')[0] + '#navpanes=0&toolbar=0&scrollbar=0';
    return this.sanitizer.bypassSecurityTrustResourceUrl(clean);
  });
}
