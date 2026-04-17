import { Component, ChangeDetectionStrategy, Input, output, signal } from '@angular/core';
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
  @Input() set note(value: string) { this.noteText.set(value); }
  readonly noteSaved = output<string>();

  readonly noteText = signal('');
}
