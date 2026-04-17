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
    on(loadTrips, (state) => ({ ...state, loading: true, error: null })),
    on(loadTripsSuccess, (state, { trips }) => ({ ...state, trips, loading: false })),
    on(loadTripsFailure, (state, { error }) => ({ ...state, loading: false, error })),
    on(selectTrip, (state, { id }) => ({ ...state, selectedTripId: id })),
    on(clearSelectedTrip, (state) => ({ ...state, selectedTripId: null })),
    on(addTrip, (state) => ({ ...state, mutating: true, error: null })),
    on(addTripSuccess, (state, { trip }) => ({
      ...state, trips: [...state.trips, trip], mutating: false,
    })),
    on(addTripFailure, (state, { error }) => ({ ...state, mutating: false, error })),
    on(updateTrip, (state) => ({ ...state, mutating: true, error: null })),
    on(updateTripSuccess, (state, { trip }) => ({
      ...state,
      trips: state.trips.map((existing) => (existing.id === trip.id ? trip : existing)),
      mutating: false,
    })),
    on(updateTripFailure, (state, { error }) => ({ ...state, mutating: false, error })),
    on(deleteTrip, (state) => ({ ...state, mutating: true, error: null })),
    on(deleteTripSuccess, (state, { id }) => ({
      ...state,
      trips: state.trips.filter((trip) => trip.id !== id),
      selectedTripId: state.selectedTripId === id ? null : state.selectedTripId,
      mutating: false,
    })),
    on(deleteTripFailure, (state, { error }) => ({ ...state, mutating: false, error })),
    on(loadTripById, (state) => ({ ...state, loading: true })),
    on(loadTripByIdSuccess, (state, { trip }) => ({
      ...state,
      trips: state.trips.some((existing) => existing.id === trip.id)
        ? state.trips.map((existing) => (existing.id === trip.id ? trip : existing))
        : [...state.trips, trip],
      selectedTripId: trip.id,
      loading: false,
    })),
    on(loadTripByIdFailure, (state, { error }) => ({ ...state, loading: false, error })),
    on(addDog, (state) => ({ ...state, mutating: true, error: null })),
    on(addDogSuccess, (state, { tripId, dog }) => ({
      ...state,
      trips: state.trips.map((trip) => trip.id !== tripId ? trip : { ...trip, dogs: [...(trip.dogs ?? []), dog] }),
      mutating: false,
    })),
    on(addDogFailure, (state, { error }) => ({ ...state, mutating: false, error })),
    on(addDogs, (state) => ({ ...state, mutating: true, error: null })),
    on(addDogsSuccess, (state, { tripId, dogs }) => ({
      ...state,
      trips: state.trips.map((trip) => trip.id !== tripId ? trip : { ...trip, dogs: [...(trip.dogs ?? []), ...dogs] }),
      mutating: false,
    })),
    on(addDogsFailure, (state, { error }) => ({ ...state, mutating: false, error })),
    on(updateDog, (state) => ({ ...state, mutating: true, error: null })),
    on(updateDogSuccess, (state, { tripId, dog }) => ({
      ...state,
      trips: state.trips.map((trip) =>
        trip.id === tripId ? { ...trip, dogs: trip.dogs?.map((existingDog) => (existingDog.id === dog.id ? dog : existingDog)) } : trip
      ),
      mutating: false,
    })),
    on(updateDogFailure, (state, { error }) => ({ ...state, mutating: false, error })),
    on(deleteDog, (state) => ({ ...state, mutating: true, error: null })),
    on(deleteDogSuccess, (state, { tripId, dogId }) => ({
      ...state,
      trips: state.trips.map((trip) => trip.id !== tripId ? trip : { ...trip, dogs: trip.dogs?.filter((dog) => dog.id !== dogId) }),
      mutating: false,
    })),
    on(deleteDogFailure, (state, { error }) => ({ ...state, mutating: false, error })),
    on(deleteDogs, (state) => ({ ...state, mutating: true, error: null })),
    on(deleteDogsSuccess, (state, { tripId, dogIds }) => ({
      ...state,
      trips: state.trips.map((trip) => trip.id !== tripId ? trip : { ...trip, dogs: trip.dogs?.filter((dog) => !dogIds.includes(dog.id)) }),
      mutating: false,
    })),
    on(deleteDogsFailure, (state, { error }) => ({ ...state, mutating: false, error }))
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
