import { createFeature, createReducer, on } from '@ngrx/store';
import { Trip } from '@myorg/models';
import { TripActions } from './trips.actions';

export interface TripsState {
  trips: Trip[];
  selectedTrip: Trip | null;
  loading: boolean;
  mutating: boolean;
  error: string | null;
}

const initialState: TripsState = {
  trips: [],
  selectedTrip: null,
  loading: false,
  mutating: false,
  error: null,
};

export const tripsFeature = createFeature({
  name: 'trips',
  reducer: createReducer(
    initialState,
    // Load
    on(TripActions.loadTrips, (s) => ({ ...s, loading: true, error: null })),
    on(TripActions.loadTripsSuccess, (s, { trips }) => ({ ...s, trips, loading: false })),
    on(TripActions.loadTripsFailure, (s, { error }) => ({ ...s, loading: false, error })),
    // Select
    on(TripActions.selectTrip, (s, { id }) => ({
      ...s,
      selectedTrip: s.trips.find((t) => t.id === id) ?? null,
    })),
    on(TripActions.clearSelectedTrip, (s) => ({ ...s, selectedTrip: null })),
    // Add
    on(TripActions.addTrip, (s) => ({ ...s, mutating: true, error: null })),
    on(TripActions.addTripSuccess, (s, { trip }) => ({
      ...s,
      trips: [...s.trips, trip],
      mutating: false,
    })),
    on(TripActions.addTripFailure, (s, { error }) => ({ ...s, mutating: false, error })),
    // Update
    on(TripActions.updateTrip, (s) => ({ ...s, mutating: true, error: null })),
    on(TripActions.updateTripSuccess, (s, { trip }) => ({
      ...s,
      trips: s.trips.map((t) => (t.id === trip.id ? trip : t)),
      selectedTrip: trip,
      mutating: false,
    })),
    on(TripActions.updateTripFailure, (s, { error }) => ({ ...s, mutating: false, error })),
    // Delete
    on(TripActions.deleteTrip, (s) => ({ ...s, mutating: true, error: null })),
    on(TripActions.deleteTripSuccess, (s, { id }) => ({
      ...s,
      trips: s.trips.filter((t) => t.id !== id),
      selectedTrip: s.selectedTrip?.id === id ? null : s.selectedTrip,
      mutating: false,
    })),
    on(TripActions.deleteTripFailure, (s, { error }) => ({ ...s, mutating: false, error }))
  ),
});

export const {
  name: tripsFeatureName,
  reducer: tripsReducer,
  selectTripsState,
  selectTrips,
  selectSelectedTrip,
  selectLoading: selectTripsLoading,
  selectMutating: selectTripsMutating,
  selectError: selectTripsError,
} = tripsFeature;
