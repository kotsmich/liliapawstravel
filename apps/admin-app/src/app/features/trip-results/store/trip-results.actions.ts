import { createAction, props } from '@ngrx/store';
import { TripResult, TripResultPayload } from '@models/lib/trip-result.model';

export const loadTripResults = createAction('[Trip Results] Load Trip Results');
export const loadTripResultsSuccess = createAction(
  '[Trip Results] Load Trip Results Success',
  props<{ results: TripResult[] }>()
);
export const loadTripResultsFailure = createAction(
  '[Trip Results] Load Trip Results Failure',
  props<{ error: string }>()
);

export const addTripResult = createAction(
  '[Trip Results] Add Trip Result',
  props<{ result: TripResultPayload; photos: File[] }>()
);
export const addTripResultSuccess = createAction(
  '[Trip Results] Add Trip Result Success',
  props<{ result: TripResult }>()
);
export const addTripResultFailure = createAction(
  '[Trip Results] Add Trip Result Failure',
  props<{ error: string }>()
);

export const updateTripResult = createAction(
  '[Trip Results] Update Trip Result',
  props<{ id: string; result: TripResultPayload }>()
);
export const updateTripResultSuccess = createAction(
  '[Trip Results] Update Trip Result Success',
  props<{ result: TripResult }>()
);
export const updateTripResultFailure = createAction(
  '[Trip Results] Update Trip Result Failure',
  props<{ error: string }>()
);

export const deleteTripResult = createAction(
  '[Trip Results] Delete Trip Result',
  props<{ id: string }>()
);
export const deleteTripResultSuccess = createAction(
  '[Trip Results] Delete Trip Result Success',
  props<{ id: string }>()
);
export const deleteTripResultFailure = createAction(
  '[Trip Results] Delete Trip Result Failure',
  props<{ error: string }>()
);

export const uploadTripResultPhotos = createAction(
  '[Trip Results] Upload Photos',
  props<{ id: string; photos: File[] }>()
);
export const uploadTripResultPhotosSuccess = createAction(
  '[Trip Results] Upload Photos Success',
  props<{ result: TripResult }>()
);
export const uploadTripResultPhotosFailure = createAction(
  '[Trip Results] Upload Photos Failure',
  props<{ error: string }>()
);

export const deleteTripResultPhoto = createAction(
  '[Trip Results] Delete Photo',
  props<{ id: string; photoId: string }>()
);
export const deleteTripResultPhotoSuccess = createAction(
  '[Trip Results] Delete Photo Success',
  props<{ result: TripResult }>()
);
export const deleteTripResultPhotoFailure = createAction(
  '[Trip Results] Delete Photo Failure',
  props<{ error: string }>()
);
