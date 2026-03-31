import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { TripsService } from '@admin/services/trips.service';
import { DogsService } from '@admin/services/dogs.service';
import { TripActions } from './trips.actions';

@Injectable()
export class TripsEffects {
  loadTrips$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TripActions.loadTrips),
      switchMap(() =>
        this.tripsService.getTrips().pipe(
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
        this.tripsService.createTrip(trip).pipe(
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
        this.tripsService.updateTrip(id, trip).pipe(
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
        this.tripsService.deleteTrip(id).pipe(
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
        this.dogsService.updateDog(dog.id, dog).pipe(
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
        this.tripsService.getTripById(id).pipe(
          map((trip) => TripActions.loadTripByIdSuccess({ trip })),
          catchError((error) => of(TripActions.loadTripByIdFailure({ error: error.message })))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private tripsService: TripsService,
    private dogsService: DogsService,
    private router: Router
  ) {}
}
