import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { TripsService } from '@admin/services/trips.service';
import { DogsService } from '@admin/services/dogs.service';
import {
  loadTrips, loadTripsSuccess, loadTripsFailure,
  addTrip, addTripSuccess, addTripFailure,
  updateTrip, updateTripSuccess, updateTripFailure,
  deleteTrip, deleteTripSuccess, deleteTripFailure,
  addDog, addDogSuccess, addDogFailure,
  updateDog, updateDogSuccess, updateDogFailure,
  loadTripById, loadTripByIdSuccess, loadTripByIdFailure,
} from './trips.actions';

@Injectable()
export class TripsEffects {
  private readonly actions$ = inject(Actions);
  private readonly tripsService = inject(TripsService);
  private readonly dogsService = inject(DogsService);
  private readonly router = inject(Router);

  loadTrips$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadTrips),
      switchMap(() =>
        this.tripsService.getTrips().pipe(
          map((trips) => loadTripsSuccess({ trips })),
          catchError((error) => of(loadTripsFailure({ error: error?.error?.message ?? error?.message ?? 'Unknown error' })))
        )
      )
    )
  );

  addTrip$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addTrip),
      switchMap(({ trip }) =>
        this.tripsService.createTrip(trip).pipe(
          map((saved) => addTripSuccess({ trip: saved })),
          catchError((error) => of(addTripFailure({ error: error?.error?.message ?? error?.message ?? 'Unknown error' })))
        )
      )
    )
  );

  addTripSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(addTripSuccess),
        tap(() => this.router.navigate(['/admin/trips']))
      ),
    { dispatch: false }
  );

  updateTrip$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateTrip),
      switchMap(({ id, trip }) =>
        this.tripsService.updateTrip(id, trip).pipe(
          map((updated) => updateTripSuccess({ trip: updated })),
          catchError((error) => of(updateTripFailure({ error: error?.error?.message ?? error?.message ?? 'Unknown error' })))
        )
      )
    )
  );

  updateTripSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(updateTripSuccess),
        tap(() => this.router.navigate(['/admin/trips']))
      ),
    { dispatch: false }
  );

  deleteTrip$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteTrip),
      switchMap(({ id }) =>
        this.tripsService.deleteTrip(id).pipe(
          map(({ id: deletedId }) => deleteTripSuccess({ id: deletedId })),
          catchError((error) => of(deleteTripFailure({ error: error?.error?.message ?? error?.message ?? 'Unknown error' })))
        )
      )
    )
  );

  addDog$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addDog),
      switchMap(({ tripId, dog }) =>
        this.dogsService.createDog(tripId, dog).pipe(
          map((saved) => addDogSuccess({ tripId, dog: saved })),
          catchError((error) => of(addDogFailure({ error: error?.error?.message ?? error?.message ?? 'Unknown error' })))
        )
      )
    )
  );

  updateDog$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateDog),
      switchMap(({ tripId, dog }) =>
        this.dogsService.updateDog(dog.id, dog).pipe(
          map((updated) => updateDogSuccess({ tripId, dog: updated })),
          catchError((error) => of(updateDogFailure({ error: error?.error?.message ?? error?.message ?? 'Unknown error' })))
        )
      )
    )
  );

  loadTripById$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadTripById),
      switchMap(({ id }) =>
        this.tripsService.getTripById(id).pipe(
          map((trip) => loadTripByIdSuccess({ trip })),
          catchError((error) => of(loadTripByIdFailure({ error: error?.error?.message ?? error?.message ?? 'Unknown error' })))
        )
      )
    )
  );
}
