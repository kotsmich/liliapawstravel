import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, filter, map, mergeMap, of, switchMap, tap, withLatestFrom } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectCalendarSelectedDate, selectDate } from '@admin/core/store/calendar';
import { Dog } from '@models/lib/dog.model';
import { TripsService } from '@admin/services/trips.service';
import { DogsService } from '@admin/services/dogs.service';
import {
  loadTrips, loadTripsSuccess, loadTripsFailure,
  addTrip, addTripSuccess, addTripFailure,
  updateTrip, updateTripSuccess, updateTripFailure,
  deleteTrip, deleteTripSuccess, deleteTripFailure,
  addDog, addDogSuccess, addDogFailure,
  addDogs, addDogsSuccess, addDogsFailure,
  deleteDog, deleteDogSuccess, deleteDogFailure,
  updateDog, updateDogSuccess, updateDogFailure,
  loadTripById, loadTripByIdSuccess, loadTripByIdFailure,
  deleteDogs, deleteDogsSuccess, deleteDogsFailure,
} from './trips.actions';

@Injectable()
export class TripsEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly tripsService = inject(TripsService);
  private readonly dogsService = inject(DogsService);
  private readonly router = inject(Router);

  autoSelectNearestDate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadTripsSuccess),
      withLatestFrom(this.store.select(selectCalendarSelectedDate)),
      filter(([, date]) => date === null),
      map(([{ trips }]) => {
        const today = new Date().toISOString().slice(0, 10);
        const sorted = trips.map((t) => t.date).filter((d) => d >= today).sort();
        const date = sorted[0] ?? [...trips.map((t) => t.date)].sort().reverse()[0];
        return selectDate({ date: date ?? today });
      })
    )
  );

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
      switchMap(({ trip, dogs }) =>
        this.tripsService.createTrip(trip).pipe(
          switchMap((saved) => {
            if (dogs && dogs.length > 0) {
              return this.dogsService.createDogs(saved.id, dogs as Dog[]).pipe(
                map((savedDogs) => addTripSuccess({ trip: { ...saved, dogs: savedDogs } })),
                catchError((error) => of(addTripFailure({ error: error?.error?.message ?? error?.message ?? 'Unknown error' })))
              );
            }
            return of(addTripSuccess({ trip: saved }));
          }),
          catchError((error) => of(addTripFailure({ error: error?.error?.message ?? error?.message ?? 'Unknown error' })))
        )
      )
    )
  );

  addTripSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(addTripSuccess),
        tap(({ trip }) => this.router.navigate(['/admin/trips', trip.id, 'edit']))
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
        // tap(() => this.router.navigate(['/admin/trips']))
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
          mergeMap((saved) => [addDogSuccess({ tripId, dog: saved }), loadTripById({ id: tripId })]),
          catchError((error) => of(addDogFailure({ error: error?.error?.message ?? error?.message ?? 'Unknown error' })))
        )
      )
    )
  );

  addDogs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addDogs),
      switchMap(({ tripId, dogs }) =>
        this.dogsService.createDogs(tripId, dogs).pipe(
          mergeMap((saved) => [addDogsSuccess({ tripId, dogs: saved }), loadTripById({ id: tripId })]),
          catchError((error) => of(addDogsFailure({ error: error?.error?.message ?? error?.message ?? 'Unknown error' })))
        )
      )
    )
  );

  deleteDog$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteDog),
      mergeMap(({ tripId, dogId }) =>
        this.dogsService.deleteDog(dogId).pipe(
          mergeMap(() => [deleteDogSuccess({ tripId, dogId }), loadTripById({ id: tripId })]),
          catchError((error) => of(deleteDogFailure({ error: error?.error?.message ?? error?.message ?? 'Unknown error' })))
        )
      )
    )
  );

  updateDog$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateDog),
      switchMap(({ tripId, dog }) =>
        this.dogsService.updateDog(dog.id, dog).pipe(
           mergeMap((updated) => [ updateDogSuccess({ tripId, dog: updated }), loadTripById({ id: tripId })]),
          catchError((error) => of(updateDogFailure({ error: error?.error?.message ?? error?.message ?? 'Unknown error' })))
        )
      )
    )
  );

  deleteDogs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteDogs),
      switchMap(({ tripId, dogIds }) =>
        this.dogsService.deleteDogs(dogIds).pipe(
          mergeMap(() => [deleteDogsSuccess({ tripId, dogIds }), loadTripById({ id: tripId })]),
          catchError((error) => of(deleteDogsFailure({ error: error?.error?.message ?? error?.message ?? 'Unknown error' })))
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
