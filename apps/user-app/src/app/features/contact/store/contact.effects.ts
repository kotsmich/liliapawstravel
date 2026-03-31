import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { ContactService } from '@user/services/contact.service';
import { ContactActions } from './contact.actions';

@Injectable()
export class ContactEffects {
  submitContact$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ContactActions.submitContact),
      switchMap(({ form }) =>
        this.contactService.submitContact(form).pipe(
          map((submission) => ContactActions.submitContactSuccess({ submission })),
          catchError((error) => of(ContactActions.submitContactFailure({ error: error.message })))
        )
      )
    )
  );

  constructor(private actions$: Actions, private contactService: ContactService) {}
}
