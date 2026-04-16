import { Component, ChangeDetectionStrategy, input, output, signal, effect } from '@angular/core';
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
  readonly note = input('');
  readonly noteSaved = output<string>();

  readonly noteText = signal('');

  constructor() {
    effect(() => {
      this.noteText.set(this.note());
    }, { allowSignalWrites: true });
  }
}
