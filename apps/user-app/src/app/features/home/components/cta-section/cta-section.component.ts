import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';


@Component({
  selector: 'app-cta-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './cta-section.component.html',
  styleUrls: ['./cta-section.component.scss'],
})
export class CtaSectionComponent {
  @Output() requestClicked = new EventEmitter<void>();
  @Output() contactClicked = new EventEmitter<void>();
}
