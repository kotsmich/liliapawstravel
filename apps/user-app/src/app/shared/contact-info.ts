export interface ContactPhone {
  /** E.164 (used for `tel:` links). */
  tel: string;
  /** Human-readable form shown in the UI. */
  display: string;
}

export const CONTACT_INFO = {
  email: 'liliapawstravel@gmail.com',
  phones: [
    { tel: '+306907288150', display: '+30 690 728 8150' },
    { tel: '+306948225016', display: '+30 694 822 5016' },
  ] as ContactPhone[],
} as const;
