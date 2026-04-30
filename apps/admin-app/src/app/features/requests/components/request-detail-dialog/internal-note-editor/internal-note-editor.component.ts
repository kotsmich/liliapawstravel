import { Component, ChangeDetectionStrategy, input, linkedSignal, output } from '@angular/core';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-internal-note-editor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TextareaModule, ButtonModule, TranslocoModule],
  templateUrl: './internal-note-editor.component.html',
  styleUrl: './internal-note-editor.component.scss',
})
export class InternalNoteEditorComponent {
  readonly entityId = input<string | null>(null);
  readonly note = input<string>('');
  readonly noteSaved = output<string>();

  readonly noteText = linkedSignal({
    source: () => this.entityId(),
    computation: () => this.note(),
  });
}
