import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createFeature, createReducer, on } from '@ngrx/store';
import { TripResult } from '@models/lib/trip-result.model';
import {
  loadTripResults, loadTripResultsSuccess, loadTripResultsFailure,
  addTripResult, addTripResultSuccess, addTripResultFailure,
  updateTripResult, updateTripResultSuccess, updateTripResultFailure,
  deleteTripResult, deleteTripResultSuccess, deleteTripResultFailure,
  uploadTripResultPhotos, uploadTripResultPhotosSuccess, uploadTripResultPhotosFailure,
  deleteTripResultPhoto, deleteTripResultPhotoSuccess, deleteTripResultPhotoFailure,
} from './trip-results.actions';

// Newest first — mirrors the order the API and the public page use.
export const adapter = createEntityAdapter<TripResult>({
  sortComparer: (a, b) => b.date.localeCompare(a.date),
});

export interface TripResultsState extends EntityState<TripResult> {
  loading: boolean;
  mutating: boolean;
  error: string | null;
}

const initialState: TripResultsState = adapter.getInitialState({
  loading: false,
  mutating: false,
  error: null,
});

export const tripResultsFeature = createFeature({
  name: 'tripResults',
  reducer: createReducer(
    initialState,
    on(loadTripResults, (state) => ({ ...state, loading: true, error: null })),
    on(loadTripResultsSuccess, (state, { results }) =>
      adapter.setAll(results, { ...state, loading: false })
    ),
    on(loadTripResultsFailure, (state, { error }) => ({ ...state, loading: false, error })),

    on(addTripResult, updateTripResult, deleteTripResult, uploadTripResultPhotos, deleteTripResultPhoto,
      (state) => ({ ...state, mutating: true, error: null })),

    on(addTripResultSuccess, (state, { result }) =>
      adapter.addOne(result, { ...state, mutating: false })
    ),
    on(updateTripResultSuccess, uploadTripResultPhotosSuccess, deleteTripResultPhotoSuccess,
      (state, { result }) => adapter.upsertOne(result, { ...state, mutating: false })
    ),
    on(deleteTripResultSuccess, (state, { id }) =>
      adapter.removeOne(id, { ...state, mutating: false })
    ),

    on(addTripResultFailure, updateTripResultFailure, deleteTripResultFailure,
      uploadTripResultPhotosFailure, deleteTripResultPhotoFailure,
      (state, { error }) => ({ ...state, mutating: false, error }))
  ),
});

export const {
  name: tripResultsFeatureName,
  reducer: tripResultsReducer,
  selectTripResultsState,
} = tripResultsFeature;
