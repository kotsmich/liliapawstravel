import { createFeature, createReducer, on } from '@ngrx/store';
import { Trip } from '@models/lib/trip.model';
import { refreshTrips, loadTripsSuccess, loadTripsFailure, clearSelectedTrip, wsTripsReceived } from './trips.actions';

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
    on(refreshTrips, (s) => ({ ...s, loading: true, error: null })),
    on(loadTripsSuccess, (s, { trips }) => ({ ...s, trips, loading: false })),
    on(loadTripsFailure, (s, { error }) => ({ ...s, loading: false, error })),
    on(clearSelectedTrip, (s) => ({ ...s })),
    on(wsTripsReceived, (s, { trips }) => ({ ...s, trips, loading: false }))
  ),
});

export const {
  name: tripsFeatureName,
  reducer: tripsReducer,
  selectTripsState,
  selectTrips,
  selectLoading: selectTripsLoading,
  selectError: selectTripsError,
} = tripsFeature;
