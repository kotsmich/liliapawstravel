import { Component, ChangeDetectionStrategy, input, computed, inject } from '@angular/core';
import { ControlContainer, ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { CheckboxModule } from 'primeng/checkbox';
import { TranslocoModule } from '@jsverse/transloco';

/**
 * Renders one status-check field: either a read-only locked display (when
 * `isReadonly` is true) or an interactive checkbox row with a conditional
 * state badge.
 *
 * Picks up the parent FormGroup automatically via ControlContainer injection —
 * no [formGroup] binding needed in the parent template.
 *
 * Extracted from trip-status-checks.component.html where the capacity-check
 * and request-acceptance-check blocks shared the same visual structure.
 */
@Component({
  selector: 'app-status-check-field',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    { provide: ControlContainer, useFactory: () => inject(ControlContainer, { skipSelf: true }) },
  ],
  imports: [ReactiveFormsModule, CheckboxModule, NgClass, TranslocoModule],
  templateUrl: './status-check-field.component.html',
  styleUrl: './status-check-field.component.scss',
})
export class StatusCheckFieldComponent {
  /** Transloco key for the section header label above the row. */
  readonly sectionLabelKey = input.required<string>();
  /** ReactiveForm control name — used by the internal p-checkbox formControlName binding. */
  readonly controlName = input.required<string>();
  /** Transloco key for the checkbox row's primary title. */
  readonly titleKey = input.required<string>();
  /** Transloco key for the checkbox row's secondary description. */
  readonly descKey = input.required<string>();
  /** Current boolean value of the control (parent reads from the FormGroup). */
  readonly checked = input.required<boolean>();

  /**
   * When true, hides the checkbox and renders a read-only locked display
   * (e.g. the "at capacity" state where the checkbox cannot be changed).
   */
  readonly isReadonly = input<boolean>(false);

  /** BEM modifier applied to `.status-check` when `checked` is true (e.g. `'danger'`). */
  readonly checkedModifier = input<string>('');
  /** BEM modifier applied to `.status-check` when `checked` is false (e.g. `'warn'`). */
  readonly uncheckedModifier = input<string>('');

  // ── Checked-state badge ────────────────────────────────────────────────────
  /** Transloco key for the badge label when checked=true. */
  readonly trueBadgeLabelKey = input.required<string>();
  /** BEM severity suffix for the badge when checked=true (`'ok' | 'danger' | 'warn'`). */
  readonly trueBadgeSeverity = input<string>('ok');
  /** CSS icon class (e.g. `'pi pi-lock'`) for the badge when checked=true. */
  readonly trueBadgeIcon = input<string>('');

  // ── Unchecked-state badge ──────────────────────────────────────────────────
  /** Transloco key for the badge label when checked=false. */
  readonly falseBadgeLabelKey = input.required<string>();
  /** BEM severity suffix for the badge when checked=false. */
  readonly falseBadgeSeverity = input<string>('ok');
  /** CSS icon class for the badge when checked=false. */
  readonly falseBadgeIcon = input<string>('');

  // ── Read-only display overrides (optional) ─────────────────────────────────
  /**
   * Transloco key for the title shown in the read-only display.
   * Falls back to `titleKey` when not provided.
   */
  readonly readonlyTitleKey = input<string>('');
  /** Transloco key for the description shown in the read-only display. */
  readonly readonlyDescKey = input<string>('');
  /** Interpolation params passed to the readonlyDescKey transloco call. */
  readonly readonlyDescParams = input<Record<string, unknown>>({});

  // ── Derived ───────────────────────────────────────────────────────────────
  readonly activeModifier = computed(() =>
    this.checked() ? this.checkedModifier() : this.uncheckedModifier()
  );
  readonly activeBadgeLabelKey = computed(() =>
    this.checked() ? this.trueBadgeLabelKey() : this.falseBadgeLabelKey()
  );
  readonly activeBadgeSeverity = computed(() =>
    this.checked() ? this.trueBadgeSeverity() : this.falseBadgeSeverity()
  );
  readonly activeBadgeIcon = computed(() =>
    this.checked() ? this.trueBadgeIcon() : this.falseBadgeIcon()
  );
  readonly effectiveReadonlyTitleKey = computed(() =>
    this.readonlyTitleKey() || this.titleKey()
  );
}
