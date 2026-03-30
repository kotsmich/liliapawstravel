import { createFeature, createReducer, on } from '@ngrx/store';
import { Trip } from '@models/lib/trip.model';
import { TripActions } from './trips.actions';

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
    on(TripActions.refreshTrips, (s) => ({ ...s, loading: true, error: null })),
    on(TripActions.loadTripsSuccess, (s, { trips }) => ({ ...s, trips, loading: false })),
    on(TripActions.loadTripsFailure, (s, { error }) => ({ ...s, loading: false, error })),
    on(TripActions.clearSelectedTrip, (s) => ({ ...s }))
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
