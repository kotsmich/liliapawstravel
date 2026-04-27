import { Injectable, Signal, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class RouterUrlService {
  private readonly router = inject(Router);

  readonly currentUrl: Signal<string> = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => (event as NavigationEnd).urlAfterRedirects || (event as NavigationEnd).url),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );
}
