import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { TripService } from '@myorg/api';
import { TripActions } from './trips.actions';

@Injectable()
export class TripsEffects {
  loadTrips$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TripActions.loadTrips),
      switchMap(() =>
        this.tripService.getTrips().pipe(
          map((trips) => TripActions.loadTripsSuccess({ trips })),
          catchError((error) => of(TripActions.loadTripsFailure({ error: error.message })))
        )
      )
    )
  );

  refreshTrips$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TripActions.refreshTrips),
      switchMap(() =>
        this.tripService.getTrips().pipe(
          map((trips) => TripActions.loadTripsSuccess({ trips })),
          catchError((error) => of(TripActions.loadTripsFailure({ error: error.message })))
        )
      )
    )
  );

  addTrip$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TripActions.addTrip),
      switchMap(({ trip }) =>
        this.tripService.addTrip(trip).pipe(
          map((saved) => TripActions.addTripSuccess({ trip: saved })),
          catchError((error) => of(TripActions.addTripFailure({ error: error.message })))
        )
      )
    )
  );

  addTripSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(TripActions.addTripSuccess),
        tap(() => this.router.navigate(['/admin/trips']))
      ),
    { dispatch: false }
  );

  updateTrip$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TripActions.updateTrip),
      switchMap(({ id, trip }) =>
        this.tripService.updateTrip(id, trip).pipe(
          map((updated) => TripActions.updateTripSuccess({ trip: updated })),
          catchError((error) => of(TripActions.updateTripFailure({ error: error.message })))
        )
      )
    )
  );

  updateTripSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(TripActions.updateTripSuccess),
        tap(() => this.router.navigate(['/admin/trips']))
      ),
    { dispatch: false }
  );

  deleteTrip$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TripActions.deleteTrip),
      switchMap(({ id }) =>
        this.tripService.deleteTrip(id).pipe(
          map(({ id: deletedId }) => TripActions.deleteTripSuccess({ id: deletedId })),
          catchError((error) => of(TripActions.deleteTripFailure({ error: error.message })))
        )
      )
    )
  );

  updateDog$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TripActions.updateDog),
      switchMap(({ tripId, dog }) =>
        this.tripService.updateDog(tripId, dog).pipe(
          map((updated) => TripActions.updateDogSuccess({ tripId, dog: updated })),
          catchError((error) => of(TripActions.updateDogFailure({ error: error.message })))
        )
      )
    )
  );

  loadTripById$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TripActions.loadTripById),
      switchMap(({ id }) =>
        this.tripService.getTripById(id).pipe(
          map((trip) => TripActions.loadTripByIdSuccess({ trip })),
          catchError((error) => of(TripActions.loadTripByIdFailure({ error: error.message })))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private tripService: TripService,
    private router: Router
  ) {}
}
