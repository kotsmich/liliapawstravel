import { createFeature, createReducer, on } from '@ngrx/store';
import { TripRequest } from '@models/lib/trip-request.model';
import { submitRequest, submitRequestSuccess, submitRequestFailure, resetRequest } from './trip-request.actions';

export interface TripRequestState {
  lastRequest: TripRequest | null;
  loading: boolean;
  success: boolean;
  error: string | null;
}

const initialState: TripRequestState = {
  lastRequest: null,
  loading: false,
  success: false,
  error: null,
};

export const tripRequestFeature = createFeature({
  name: 'tripRequest',
  reducer: createReducer(
    initialState,
    on(submitRequest, (s) => ({ ...s, loading: true, success: false, error: null })),
    on(submitRequestSuccess, (s, { request }) => ({
      ...s,
      lastRequest: request,
      loading: false,
      success: true,
    })),
    on(submitRequestFailure, (s, { error }) => ({ ...s, loading: false, error })),
    on(resetRequest, (s) => ({ ...s, loading: false, success: false, error: null }))
  ),
});

export const {
  name: tripRequestFeatureName,
  reducer: tripRequestReducer,
  selectTripRequestState,
  selectLastRequest,
  selectLoading: selectTripRequestLoading,
  selectSuccess: selectTripRequestSuccess,
  selectError: selectTripRequestError,
} = tripRequestFeature;
