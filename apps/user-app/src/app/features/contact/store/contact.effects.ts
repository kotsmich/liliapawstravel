import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { ContactService } from '@user/services/contact.service';
import { submitContact, submitContactSuccess, submitContactFailure } from './contact.actions';

@Injectable()
export class ContactEffects {
  submitContact$ = createEffect(() =>
    this.actions$.pipe(
      ofType(submitContact),
      switchMap(({ form }) =>
        this.contactService.submitContact(form).pipe(
          map((submission) => submitContactSuccess({ submission })),
          catchError((error) => of(submitContactFailure({ error: error.message })))
        )
      )
    )
  );

  constructor(private actions$: Actions, private contactService: ContactService) {}
}
