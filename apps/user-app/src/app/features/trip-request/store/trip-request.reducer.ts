import { createFeature, createReducer, on } from '@ngrx/store';
import { TripRequest } from '@models/lib/trip-request.model';
import { TripRequestActions } from './trip-request.actions';

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
    on(TripRequestActions.submitRequest, (s) => ({ ...s, loading: true, success: false, error: null })),
    on(TripRequestActions.submitRequestSuccess, (s, { request }) => ({
      ...s,
      lastRequest: request,
      loading: false,
      success: true,
    })),
    on(TripRequestActions.submitRequestFailure, (s, { error }) => ({ ...s, loading: false, error })),
    on(TripRequestActions.resetRequest, (s) => ({ ...s, loading: false, success: false, error: null }))
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
