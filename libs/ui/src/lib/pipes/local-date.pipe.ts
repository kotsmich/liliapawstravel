import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'localDate', pure: true, standalone: true })
export class LocalDatePipe implements PipeTransform {
  transform(iso: string | null | undefined): string {
    if (!iso) return '—';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }
}
