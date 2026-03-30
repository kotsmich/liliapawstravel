import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs';
import { selectIsAuthenticated } from '@admin/store/auth';

export const authGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);
  return store.select(selectIsAuthenticated).pipe(
    take(1),
    map((auth) => (auth ? true : router.createUrlTree(['/admin/login'])))
  );
};
