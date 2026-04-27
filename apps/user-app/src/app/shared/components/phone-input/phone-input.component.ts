import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { IftaLabelModule } from 'primeng/iftalabel';
import { SelectModule } from 'primeng/select';

export interface CountryDialCode {
  /** Display label, e.g. "Greece +30". */
  label: string;
  /** Two-letter country code (lowercase) for the flag asset. */
  code: string;
  /** Dial prefix incl. plus sign, e.g. "+30". */
  value: string;
}

export const DEFAULT_COUNTRY_CODES: CountryDialCode[] = [
  { label: 'Greece +30',      code: 'gr', value: '+30'  },
  { label: 'USA +1',          code: 'us', value: '+1'   },
  { label: 'UK +44',          code: 'gb', value: '+44'  },
  { label: 'Germany +49',     code: 'de', value: '+49'  },
  { label: 'France +33',      code: 'fr', value: '+33'  },
  { label: 'Italy +39',       code: 'it', value: '+39'  },
  { label: 'Spain +34',       code: 'es', value: '+34'  },
  { label: 'Netherlands +31', code: 'nl', value: '+31'  },
  { label: 'Belgium +32',     code: 'be', value: '+32'  },
  { label: 'Switzerland +41', code: 'ch', value: '+41'  },
  { label: 'Austria +43',     code: 'at', value: '+43'  },
  { label: 'Portugal +351',   code: 'pt', value: '+351' },
  { label: 'Poland +48',      code: 'pl', value: '+48'  },
  { label: 'Romania +40',     code: 'ro', value: '+40'  },
  { label: 'Bulgaria +359',   code: 'bg', value: '+359' },
  { label: 'Cyprus +357',     code: 'cy', value: '+357' },
  { label: 'Australia +61',   code: 'au', value: '+61'  },
];

/**
 * Phone input that combines a country dial code and a national number into a
 * single form value of the shape "+30 6907288150".
 */
@Component({
  selector: 'lp-phone-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, InputTextModule, IftaLabelModule, SelectModule],
  templateUrl: './phone-input.component.html',
  styleUrls: ['./phone-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhoneInputComponent),
      multi: true,
    },
  ],
})
export class PhoneInputComponent implements ControlValueAccessor {
  readonly inputId = input<string>('phone');
  readonly label = input.required<string>();
  readonly ariaLabel = input<string>('');
  readonly countries = input<CountryDialCode[]>(DEFAULT_COUNTRY_CODES);

  readonly dialCode = signal<string>('+30');
  readonly nationalNumber = signal<string>('');
  readonly disabled = signal<boolean>(false);
  readonly invalid = input<boolean>(false);

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: string | null | undefined): void {
    if (!value) {
      this.dialCode.set('+30');
      this.nationalNumber.set('');
      return;
    }
    const trimmed = value.trim();
    const space = trimmed.indexOf(' ');
    if (trimmed.startsWith('+') && space > 0) {
      this.dialCode.set(trimmed.slice(0, space));
      this.nationalNumber.set(trimmed.slice(space + 1));
    } else {
      this.nationalNumber.set(trimmed);
    }
  }

  registerOnChange(fn: (value: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled.set(isDisabled); }

  onDialCodeChange(value: string): void {
    this.dialCode.set(value);
    this.emit();
  }

  onNumberChange(value: string): void {
    this.nationalNumber.set(value);
    this.emit();
  }

  onBlur(): void { this.onTouched(); }

  private emit(): void {
    const number = this.nationalNumber().trim();
    this.onChange(number ? `${this.dialCode()} ${number}`.trim() : '');
  }
}
