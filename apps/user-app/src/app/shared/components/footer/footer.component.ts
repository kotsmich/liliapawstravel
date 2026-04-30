import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { CONTACT_INFO } from '@user/shared/contact-info';
import { LinkService } from '@user/services/link.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslocoModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  protected readonly linkService = inject(LinkService);

  readonly contact = CONTACT_INFO;
  year = new Date().getFullYear();
}
