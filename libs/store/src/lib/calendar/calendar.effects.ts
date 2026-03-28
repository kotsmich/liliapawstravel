import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { CalendarService } from '@myorg/api';
import { CalendarActions } from './calendar.actions';

@Injectable()
export class CalendarEffects {
  loadEvents$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CalendarActions.loadEvents),
      switchMap(() =>
        this.calendarService.getEvents().pipe(
          map((events) => CalendarActions.loadEventsSuccess({ events })),
          catchError((error) => of(CalendarActions.loadEventsFailure({ error: error.message })))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private calendarService: CalendarService
  ) {}
}
