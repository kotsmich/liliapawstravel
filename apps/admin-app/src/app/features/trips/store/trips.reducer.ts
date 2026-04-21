import { createEntityAdapter, EntityState } from '@ngrx/entity';
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

export const adapter = createEntityAdapter<Trip>();

export interface TripsState extends EntityState<Trip> {
  selectedTripId: string | null;
  loading: boolean;
  mutating: boolean;
  error: string | null;
}

const initialState: TripsState = adapter.getInitialState({
  selectedTripId: null,
  loading: false,
  mutating: false,
  error: null,
});

export const tripsFeature = createFeature({
  name: 'trips',
  reducer: createReducer(
    initialState,
    on(loadTrips, (state) => ({ ...state, loading: true, error: null })),
    on(loadTripsSuccess, (state, { trips }) => adapter.setAll(trips, { ...state, loading: false })),
    on(loadTripsFailure, (state, { error }) => ({ ...state, loading: false, error })),
    on(selectTrip, (state, { id }) => ({ ...state, selectedTripId: id })),
    on(clearSelectedTrip, (state) => ({ ...state, selectedTripId: null })),
    on(addTrip, (state) => ({ ...state, mutating: true, error: null })),
    on(addTripSuccess, (state, { trip }) => adapter.addOne(trip, { ...state, mutating: false })),
    on(addTripFailure, (state, { error }) => ({ ...state, mutating: false, error })),
    on(updateTrip, (state) => ({ ...state, mutating: true, error: null })),
    on(updateTripSuccess, (state, { trip }) =>
      adapter.updateOne({ id: trip.id, changes: trip }, { ...state, mutating: false })
    ),
    on(updateTripFailure, (state, { error }) => ({ ...state, mutating: false, error })),
    on(deleteTrip, (state) => ({ ...state, mutating: true, error: null })),
    on(deleteTripSuccess, (state, { id }) =>
      adapter.removeOne(id, {
        ...state,
        selectedTripId: state.selectedTripId === id ? null : state.selectedTripId,
        mutating: false,
      })
    ),
    on(deleteTripFailure, (state, { error }) => ({ ...state, mutating: false, error })),
    on(loadTripById, (state) => ({ ...state, loading: true })),
    on(loadTripByIdSuccess, (state, { trip }) =>
      adapter.upsertOne(trip, { ...state, selectedTripId: trip.id, loading: false })
    ),
    on(loadTripByIdFailure, (state, { error }) => ({ ...state, loading: false, error })),
    on(addDog, (state) => ({ ...state, mutating: true, error: null })),
    on(addDogSuccess, (state, { tripId, dog }) =>
      adapter.updateOne(
        { id: tripId, changes: { dogs: [...(state.entities[tripId]?.dogs ?? []), dog] } },
        { ...state, mutating: false }
      )
    ),
    on(addDogFailure, (state, { error }) => ({ ...state, mutating: false, error })),
    on(addDogs, (state) => ({ ...state, mutating: true, error: null })),
    on(addDogsSuccess, (state, { tripId, dogs }) =>
      adapter.updateOne(
        { id: tripId, changes: { dogs: [...(state.entities[tripId]?.dogs ?? []), ...dogs] } },
        { ...state, mutating: false }
      )
    ),
    on(addDogsFailure, (state, { error }) => ({ ...state, mutating: false, error })),
    on(updateDog, (state) => ({ ...state, mutating: true, error: null })),
    on(updateDogSuccess, (state, { tripId, dog }) =>
      adapter.updateOne(
        { id: tripId, changes: { dogs: state.entities[tripId]?.dogs?.map((d) => (d.id === dog.id ? dog : d)) } },
        { ...state, mutating: false }
      )
    ),
    on(updateDogFailure, (state, { error }) => ({ ...state, mutating: false, error })),
    on(deleteDog, (state) => ({ ...state, mutating: true, error: null })),
    on(deleteDogSuccess, (state, { tripId, dogId }) =>
      adapter.updateOne(
        { id: tripId, changes: { dogs: state.entities[tripId]?.dogs?.filter((d) => d.id !== dogId) } },
        { ...state, mutating: false }
      )
    ),
    on(deleteDogFailure, (state, { error }) => ({ ...state, mutating: false, error })),
    on(deleteDogs, (state) => ({ ...state, mutating: true, error: null })),
    on(deleteDogsSuccess, (state, { tripId, dogIds }) =>
      adapter.updateOne(
        { id: tripId, changes: { dogs: state.entities[tripId]?.dogs?.filter((d) => !dogIds.includes(d.id)) } },
        { ...state, mutating: false }
      )
    ),
    on(deleteDogsFailure, (state, { error }) => ({ ...state, mutating: false, error }))
  ),
});

export const {
  name: tripsFeatureName,
  reducer: tripsReducer,
  selectTripsState,
  selectLoading: selectTripsLoading,
  selectMutating: selectTripsMutating,
  selectError: selectTripsError,
} = tripsFeature;
