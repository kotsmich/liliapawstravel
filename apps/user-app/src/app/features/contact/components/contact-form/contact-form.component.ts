import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { IftaLabelModule } from 'primeng/iftalabel';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    ButtonModule,
    IftaLabelModule,
    MessageModule
],
  template: `
    <div class="form-wrapper">
      @if (success) {
        <div class="feedback success flex align-items-start flex-wrap gap-3">
          <i class="pi pi-check-circle"></i>
          <div><h3>Message sent!</h3><p>We'll respond within 24 hours.</p></div>
          <p-button label="Send Another" [outlined]="true" severity="success" (onClick)="reset.emit()" />
        </div>
      }
      @if (error) {
        <p-message severity="error" [text]="'Error: ' + error" styleClass="mb-3" />
      }
    
      @if (!success) {
        <form [formGroup]="form" (ngSubmit)="formSubmit.emit()" novalidate>
          <div class="row">
            <div class="field fw">
              <p-ifta-label>
                <input pInputText id="name" formControlName="name" />
                <label for="name">Full Name</label>
              </p-ifta-label>
              @if (form.get('name')?.touched && err('name')) {
                <small class="p-error">{{ err('name') }}</small>
              }
            </div>
            <div class="field fw">
              <p-ifta-label>
                <input pInputText id="email" formControlName="email" type="email" />
                <label for="email">Email</label>
              </p-ifta-label>
              @if (emailHint) {
                <small class="hint">{{ emailHint }}</small>
              }
              @if (form.get('email')?.touched && err('email')) {
                <small class="p-error">{{ err('email') }}</small>
              }
            </div>
          </div>
          <div class="row">
            <div class="field fw">
              <p-ifta-label>
                <input pInputText id="phone" formControlName="phone" type="tel" />
                <label for="phone">Phone (optional)</label>
              </p-ifta-label>
              @if (form.get('phone')?.touched && err('phone')) {
                <small class="p-error">{{ err('phone') }}</small>
              }
            </div>
            <div class="field fw">
              <p-ifta-label>
                <input pInputText id="subject" formControlName="subject" />
                <label for="subject">Subject</label>
              </p-ifta-label>
              @if (form.get('subject')?.touched && err('subject')) {
                <small class="p-error">{{ err('subject') }}</small>
              }
            </div>
          </div>
          <div class="field fw">
            <p-ifta-label>
              <textarea pTextarea id="message" formControlName="message" rows="6" autoResize></textarea>
              <label for="message">Message</label>
            </p-ifta-label>
            @if (form.get('message')?.touched && err('message')) {
              <small class="p-error">{{ err('message') }}</small>
            }
          </div>
          <p-button
            type="submit"
            label="{{ loading ? 'Sending...' : 'Send Message' }}"
            [loading]="loading"
            [disabled]="loading"
            />
        </form>
      }
    </div>
    `,
  styles: [],
})
export class ContactFormComponent {
  @Input() form!: FormGroup;
  @Input() loading: boolean = false;
  @Input() success: boolean = false;
  @Input() error: string | null = null;

  @Output() formSubmit = new EventEmitter<void>();
  @Output() reset = new EventEmitter<void>();

  get emailHint(): string | null {
    const ctrl = this.form?.get('email');
    if (!ctrl) return null;
    const val = ctrl.value as string;
    return val && !ctrl.hasError('email') ? `We'll reply to ${val}` : null;
  }

  err(field: string): string | null {
    const c = this.form?.get(field);
    if (!c?.errors || !c.touched) return null;
    if (c.errors['required']) return 'Required.';
    if (c.errors['email']) return 'Valid email required.';
    if (c.errors['minlength']) return `Min ${c.errors['minlength'].requiredLength} chars.`;
    if (c.errors['pattern']) return 'Invalid phone number.';
    return null;
  }
}
