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
  addDogs, addDogsSuccess, addDogsFailure,
  deleteDog, deleteDogSuccess, deleteDogFailure,
  deleteDogs, deleteDogsSuccess, deleteDogsFailure,
  updateDog, updateDogSuccess, updateDogFailure,
} from './trips.actions';

export interface TripsState {
  trips: Trip[];
  selectedTripId: string | null;
  loading: boolean;
  mutating: boolean;
  error: string | null;
}

const initialState: TripsState = {
  trips: [],
  selectedTripId: null,
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
    on(selectTrip, (s, { id }) => ({ ...s, selectedTripId: id })),
    on(clearSelectedTrip, (s) => ({ ...s, selectedTripId: null })),
    on(addTrip, (s) => ({ ...s, mutating: true, error: null })),
    on(addTripSuccess, (s, { trip }) => ({
      ...s, trips: [...s.trips, trip], mutating: false,
    })),
    on(addTripFailure, (s, { error }) => ({ ...s, mutating: false, error })),
    on(updateTrip, (s) => ({ ...s, mutating: true, error: null })),
    on(updateTripSuccess, (s, { trip }) => ({
      ...s,
      trips: s.trips.map((t) => (t.id === trip.id ? trip : t)),
      mutating: false,
    })),
    on(updateTripFailure, (s, { error }) => ({ ...s, mutating: false, error })),
    on(deleteTrip, (s) => ({ ...s, mutating: true, error: null })),
    on(deleteTripSuccess, (s, { id }) => ({
      ...s,
      trips: s.trips.filter((t) => t.id !== id),
      selectedTripId: s.selectedTripId === id ? null : s.selectedTripId,
      mutating: false,
    })),
    on(deleteTripFailure, (s, { error }) => ({ ...s, mutating: false, error })),
    on(loadTripById, (s) => ({ ...s, loading: true })),
    on(loadTripByIdSuccess, (s, { trip }) => ({
      ...s,
      trips: s.trips.some((t) => t.id === trip.id)
        ? s.trips.map((t) => (t.id === trip.id ? trip : t))
        : [...s.trips, trip],
      selectedTripId: trip.id,
      loading: false,
    })),
    on(loadTripByIdFailure, (s, { error }) => ({ ...s, loading: false, error })),
    on(addDog, (s) => ({ ...s, mutating: true, error: null })),
    on(addDogSuccess, (s, { tripId, dog }) => ({
      ...s,
      trips: s.trips.map((t) => {
        if (t.id !== tripId) return t;
        const newSpotsAvailable = Math.max(0, t.spotsAvailable - 1);
        return { ...t, dogs: [...(t.dogs ?? []), dog], spotsAvailable: newSpotsAvailable, isFull: newSpotsAvailable <= 0 };
      }),
      mutating: false,
    })),
    on(addDogFailure, (s, { error }) => ({ ...s, mutating: false, error })),
    on(addDogs, (s) => ({ ...s, mutating: true, error: null })),
    on(addDogsSuccess, (s, { tripId, dogs }) => ({
      ...s,
      trips: s.trips.map((t) => {
        if (t.id !== tripId) return t;
        const newSpotsAvailable = Math.max(0, t.spotsAvailable - dogs.length);
        return { ...t, dogs: [...(t.dogs ?? []), ...dogs], spotsAvailable: newSpotsAvailable, isFull: newSpotsAvailable <= 0 };
      }),
      mutating: false,
    })),
    on(addDogsFailure, (s, { error }) => ({ ...s, mutating: false, error })),
    on(updateDog, (s) => ({ ...s, mutating: true, error: null })),
    on(updateDogSuccess, (s, { tripId, dog }) => ({
      ...s,
      trips: s.trips.map((t) =>
        t.id === tripId ? { ...t, dogs: t.dogs?.map((d) => (d.id === dog.id ? dog : d)) } : t
      ),
      mutating: false,
    })),
    on(updateDogFailure, (s, { error }) => ({ ...s, mutating: false, error })),
    on(deleteDog, (s) => ({ ...s, mutating: true, error: null })),
    on(deleteDogSuccess, (s, { tripId, dogId }) => ({
      ...s,
      trips: s.trips.map((t) => {
        if (t.id !== tripId) return t;
        const newSpotsAvailable = t.spotsAvailable + 1;
        return { ...t, dogs: t.dogs?.filter((d) => d.id !== dogId), spotsAvailable: newSpotsAvailable, isFull: newSpotsAvailable <= 0 };
      }),
      mutating: false,
    })),
    on(deleteDogFailure, (s, { error }) => ({ ...s, mutating: false, error })),
    on(deleteDogs, (s) => ({ ...s, mutating: true, error: null })),
    on(deleteDogsSuccess, (s, { tripId, dogIds }) => ({
      ...s,
      trips: s.trips.map((t) => {
        if (t.id !== tripId) return t;
        const newSpots = Math.min(t.totalCapacity, t.spotsAvailable + dogIds.length);
        return { ...t, dogs: t.dogs?.filter((d) => !dogIds.includes(d.id)), spotsAvailable: newSpots, isFull: newSpots <= 0 };
      }),
      mutating: false,
    })),
    on(deleteDogsFailure, (s, { error }) => ({ ...s, mutating: false, error }))
  ),
});

export const {
  name: tripsFeatureName,
  reducer: tripsReducer,
  selectTripsState,
  selectTrips,
  selectLoading: selectTripsLoading,
  selectMutating: selectTripsMutating,
  selectError: selectTripsError,
} = tripsFeature;
