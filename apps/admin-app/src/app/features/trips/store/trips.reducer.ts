import { createFeature, createReducer, on } from '@ngrx/store';
import { Trip } from '@models/lib/trip.model';
import {
  loadTrips, loadTripsSuccess, loadTripsFailure,
  selectTrip, clearSelectedTrip,
  addTrip, addTripSuccess, addTripFailure,
  updateTrip, updateTripSuccess, updateTripFailure,
  deleteTrip, deleteTripSuccess, deleteTripFailure,
  loadTripById, loadTripByIdSuccess, loadTripByIdFailure,
  addDog, addDogSuccess, addDogFailure,
  updateDog, updateDogSuccess, updateDogFailure,
} from './trips.actions';

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
    on(loadTrips, (s) => ({ ...s, loading: true, error: null })),
    on(loadTripsSuccess, (s, { trips }) => ({ ...s, trips, loading: false })),
    on(loadTripsFailure, (s, { error }) => ({ ...s, loading: false, error })),
    on(selectTrip, (s, { id }) => ({
      ...s, selectedTrip: s.trips.find((t) => t.id === id) ?? null,
    })),
    on(clearSelectedTrip, (s) => ({ ...s, selectedTrip: null })),
    on(addTrip, (s) => ({ ...s, mutating: true, error: null })),
    on(addTripSuccess, (s, { trip }) => ({
      ...s, trips: [...s.trips, trip], mutating: false,
    })),
    on(addTripFailure, (s, { error }) => ({ ...s, mutating: false, error })),
    on(updateTrip, (s) => ({ ...s, mutating: true, error: null })),
    on(updateTripSuccess, (s, { trip }) => ({
      ...s,
      trips: s.trips.map((t) => (t.id === trip.id ? trip : t)),
      selectedTrip: trip,
      mutating: false,
    })),
    on(updateTripFailure, (s, { error }) => ({ ...s, mutating: false, error })),
    on(deleteTrip, (s) => ({ ...s, mutating: true, error: null })),
    on(deleteTripSuccess, (s, { id }) => ({
      ...s,
      trips: s.trips.filter((t) => t.id !== id),
      selectedTrip: s.selectedTrip?.id === id ? null : s.selectedTrip,
      mutating: false,
    })),
    on(deleteTripFailure, (s, { error }) => ({ ...s, mutating: false, error })),
    on(loadTripById, (s) => ({ ...s, loading: true })),
    on(loadTripByIdSuccess, (s, { trip }) => ({
      ...s,
      selectedTrip: trip,
      trips: s.trips.map((t) => (t.id === trip.id ? trip : t)),
      loading: false,
    })),
    on(loadTripByIdFailure, (s, { error }) => ({ ...s, loading: false, error })),
    on(addDog, (s) => ({ ...s, mutating: true, error: null })),
    on(addDogSuccess, (s, { tripId, dog }) => ({
      ...s,
      trips: s.trips.map((t) =>
        t.id === tripId ? { ...t, dogs: [...(t.dogs ?? []), dog] } : t
      ),
      selectedTrip: s.selectedTrip?.id === tripId
        ? { ...s.selectedTrip, dogs: [...(s.selectedTrip.dogs ?? []), dog] }
        : s.selectedTrip,
      mutating: false,
    })),
    on(addDogFailure, (s, { error }) => ({ ...s, mutating: false, error })),
    on(updateDog, (s) => ({ ...s, mutating: true, error: null })),
    on(updateDogSuccess, (s, { tripId, dog }) => ({
      ...s,
      trips: s.trips.map((t) =>
        t.id === tripId ? { ...t, dogs: t.dogs?.map((d) => (d.id === dog.id ? dog : d)) } : t
      ),
      selectedTrip: s.selectedTrip?.id === tripId
        ? { ...s.selectedTrip, dogs: s.selectedTrip.dogs?.map((d) => (d.id === dog.id ? dog : d)) }
        : s.selectedTrip,
      mutating: false,
    })),
    on(updateDogFailure, (s, { error }) => ({ ...s, mutating: false, error }))
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
