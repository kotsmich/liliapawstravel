import { AbstractControl, ValidationErrors } from '@angular/forms';

export function requesterRequiredValidator(group: AbstractControl): ValidationErrors | null {
  const hasExisting = !!group.get('requesterId')?.value;
  const hasNew = !!group.get('newRequesterName')?.value?.trim();
  return hasExisting || hasNew ? null : { requesterRequired: true };
}
