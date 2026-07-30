import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of, switchMap } from 'rxjs';
import { TripResultsService } from '@admin/services/trip-results.service';
import { extractError } from '@admin/shared/utils/extract-error';
import {
  loadTripResults, loadTripResultsSuccess, loadTripResultsFailure,
  addTripResult, addTripResultSuccess, addTripResultFailure,
  updateTripResult, updateTripResultSuccess, updateTripResultFailure,
  deleteTripResult, deleteTripResultSuccess, deleteTripResultFailure,
  uploadTripResultPhotos, uploadTripResultPhotosSuccess, uploadTripResultPhotosFailure,
  deleteTripResultPhoto, deleteTripResultPhotoSuccess, deleteTripResultPhotoFailure,
} from './trip-results.actions';

@Injectable()
export class TripResultsEffects {
  private readonly actions$ = inject(Actions);
  private readonly service = inject(TripResultsService);

  loadTripResults$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadTripResults),
      switchMap(() =>
        this.service.getTripResults().pipe(
          map((results) => loadTripResultsSuccess({ results })),
          catchError((error) => of(loadTripResultsFailure({ error: extractError(error) })))
        )
      )
    )
  );

  // Photos can only be attached once the result has an id, so the create call
  // chains straight into the upload when the admin picked files up front.
  addTripResult$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addTripResult),
      mergeMap(({ result, photos }) =>
        this.service.createTripResult(result).pipe(
          switchMap((created) =>
            photos.length
              ? this.service.uploadPhotos(created.id, photos)
              : of(created)
          ),
          map((saved) => addTripResultSuccess({ result: saved })),
          catchError((error) => of(addTripResultFailure({ error: extractError(error) })))
        )
      )
    )
  );

  updateTripResult$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateTripResult),
      mergeMap(({ id, result }) =>
        this.service.updateTripResult(id, result).pipe(
          map((updated) => updateTripResultSuccess({ result: updated })),
          catchError((error) => of(updateTripResultFailure({ error: extractError(error) })))
        )
      )
    )
  );

  deleteTripResult$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteTripResult),
      mergeMap(({ id }) =>
        this.service.deleteTripResult(id).pipe(
          map(() => deleteTripResultSuccess({ id })),
          catchError((error) => of(deleteTripResultFailure({ error: extractError(error) })))
        )
      )
    )
  );

  uploadPhotos$ = createEffect(() =>
    this.actions$.pipe(
      ofType(uploadTripResultPhotos),
      mergeMap(({ id, photos }) =>
        this.service.uploadPhotos(id, photos).pipe(
          map((result) => uploadTripResultPhotosSuccess({ result })),
          catchError((error) => of(uploadTripResultPhotosFailure({ error: extractError(error) })))
        )
      )
    )
  );

  deletePhoto$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteTripResultPhoto),
      mergeMap(({ id, photoId }) =>
        this.service.deletePhoto(id, photoId).pipe(
          map((result) => deleteTripResultPhotoSuccess({ result })),
          catchError((error) => of(deleteTripResultPhotoFailure({ error: extractError(error) })))
        )
      )
    )
  );
}
