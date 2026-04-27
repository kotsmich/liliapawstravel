import { createFeature, createReducer, on } from '@ngrx/store';
import { Trip } from '@models/lib/trip.model';
import { refreshTrips, loadTripsSuccess, loadTripsFailure, wsTripsReceived } from './trips.actions';

export interface TripsState {
  trips: Trip[];
  loading: boolean;
  error: string | null;
}

const initialState: TripsState = {
  trips: [],
  loading: false,
  error: null,
};

export const tripsFeature = createFeature({
  name: 'trips',
  reducer: createReducer(
    initialState,
    on(refreshTrips, (state) => ({ ...state, loading: true, error: null })),
    on(loadTripsSuccess, (state, { trips }) => ({ ...state, trips, loading: false })),
    on(loadTripsFailure, (state, { error }) => ({ ...state, loading: false, error })),
    on(wsTripsReceived, (state, { trips }) => ({ ...state, trips, loading: false }))
  ),
});

export const {
  name: tripsFeatureName,
  reducer: tripsReducer,
  selectTripsState,
  selectTrips: selectAllTrips,
  selectLoading: selectTripsIsLoading,
  selectError: selectTripsError,
} = tripsFeature;
