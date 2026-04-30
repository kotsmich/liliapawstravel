import { Component, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { SeoService } from '@user/services/seo.service';
import { DEFAULT_LANG, SupportedLang, isSupportedLang } from '@user/core/i18n/supported-langs';

@Component({
  selector: 'app-not-found',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslocoModule],
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss'],
})
export class NotFoundComponent implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly transloco = inject(TranslocoService);

  readonly lang: SupportedLang = isSupportedLang(this.transloco.getActiveLang())
    ? (this.transloco.getActiveLang() as SupportedLang)
    : DEFAULT_LANG;

  ngOnInit(): void {
    this.seo.apply({
      title: this.transloco.translate('seo.notFound.title', undefined, this.lang),
      description: this.transloco.translate('seo.notFound.description', undefined, this.lang),
      path: '/404',
      lang: this.lang,
      robots: 'noindex, follow',
    });
  }
}
