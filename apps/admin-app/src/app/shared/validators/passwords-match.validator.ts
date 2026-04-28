import { AbstractControl, ValidationErrors } from '@angular/forms';

export function passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
  const newPwd = group.get('newPassword')?.value as string;
  const confirm = group.get('confirmPassword')?.value as string;
  if (!confirm) return null;
  return newPwd === confirm ? null : { mismatch: true };
}
