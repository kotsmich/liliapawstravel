import { inject, Injectable } from '@angular/core';
import { Actions, createEffect } from '@ngrx/effects';
import { MessageService } from 'primeng/api';
import { filter, tap } from 'rxjs';
import { TOAST_REGISTRY } from './toast.registry';

@Injectable()
export class NotificationEffects {
  private readonly actions$ = inject(Actions);
  private readonly messageService = inject(MessageService);

  showToast$ = createEffect(
    () =>
      this.actions$.pipe(
        filter((action) => action.type in TOAST_REGISTRY),
        tap((action) => this.messageService.add(TOAST_REGISTRY[action.type](action)))
      ),
    { dispatch: false }
  );
}
