import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { TripRequestService } from '@user/services/trip-request.service';
import { TripsService } from '@user/services/trips.service';
import { dogUploadFailed } from '@user/core/toast/toast.actions';
import {
  DogFiles,
  submitRequest,
  submitRequestSuccess,
  submitRequestFailure,
} from './trip-request.actions';

@Injectable()
export class TripRequestEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly tripRequestService = inject(TripRequestService);
  private readonly tripsService = inject(TripsService);

  submitRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(submitRequest),
      switchMap(({ dogs, dogFiles, tripId, requesterName, requesterEmail, requesterPhone }) =>
        this.uploadAllDogs(dogs, dogFiles).pipe(
          switchMap((uploadedDogs) =>
            this.tripRequestService.submitRequest({
              dogs: uploadedDogs,
              tripId,
              requesterName,
              requesterEmail,
              requesterPhone,
            }).pipe(
              map((request) => submitRequestSuccess({ request })),
              catchError((error) => {
                const message =
                  error.status === 409
                    ? error.error?.message ?? 'This trip has no remaining capacity.'
                    : error?.error?.message ?? error?.message ?? 'Something went wrong.';
                return of(submitRequestFailure({ error: message }));
              })
            )
          )
        )
      )
    )
  );

  private uploadAllDogs(
    dogs: Record<string, unknown>[],
    dogFiles: DogFiles[],
  ): Observable<Record<string, unknown>[]> {
    if (!dogs.length) return of([]);
    return forkJoin(
      dogs.map((dog, index) => this.uploadOneDog(dog, dogFiles[index] ?? { photo: null, document: null }))
    );
  }

  private uploadOneDog(
    dog: Record<string, unknown>,
    files: DogFiles,
  ): Observable<Record<string, unknown>> {
    if (!files.photo && !files.document) return of(dog);

    const formData = new FormData();
    if (files.photo) formData.append('photo', files.photo);
    if (files.document) formData.append('document', files.document);

    return this.tripsService.uploadTempDogFiles(formData).pipe(
      map((urls) => ({
        ...dog,
        photoUrl: urls.photoUrl ?? null,
        documentUrl: urls.documentUrl ?? null,
      })),
      catchError(() => {
        this.store.dispatch(dogUploadFailed());
        return of(dog);
      }),
    );
  }
}
