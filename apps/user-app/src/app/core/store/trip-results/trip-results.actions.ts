import { createAction, props } from '@ngrx/store';
import { TripResult } from '@models/lib/trip-result.model';

export const loadTripResults = createAction('[Trip Results] Load Trip Results');

export const loadTripResultsSuccess = createAction(
  '[Trip Results] Load Trip Results Success',
  props<{ results: TripResult[] }>()
);

export const loadTripResultsFailure = createAction(
  '[Trip Results] Load Trip Results Failure',
  props<{ error: string }>()
);

export const loadTripResultById = createAction(
  '[Trip Results] Load Trip Result By Id',
  props<{ id: string }>()
);

export const loadTripResultByIdSuccess = createAction(
  '[Trip Results] Load Trip Result By Id Success',
  props<{ result: TripResult }>()
);

export const loadTripResultByIdFailure = createAction(
  '[Trip Results] Load Trip Result By Id Failure',
  props<{ error: string }>()
);
