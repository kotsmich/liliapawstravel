import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { delay } from 'rxjs/operators';
import { CalendarEvent } from '@myorg/models';
import { TripService } from '@myorg/api';
import { CalendarActions } from './calendar.actions';

@Injectable()
export class CalendarEffects {
  loadEvents$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CalendarActions.loadEvents),
      switchMap(() =>
        this.tripService.getTrips().pipe(
          map((trips) => {
            const events: CalendarEvent[] = trips.map((t) => ({
              id: t.id,
              tripId: t.id,
              title: `${t.departureCity} → ${t.arrivalCity}`,
              date: t.date,
              color: t.status === 'completed' ? '#9e9e9e' : '#c47c3e',
            }));
            return CalendarActions.loadEventsSuccess({ events });
          }),
          catchError((error) => of(CalendarActions.loadEventsFailure({ error: error.message })))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private tripService: TripService
  ) {}
}
