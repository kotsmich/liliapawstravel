import { createFeature, createReducer, on } from '@ngrx/store';
import { TripResult } from '@models/lib/trip-result.model';
import {
  loadTripResults, loadTripResultsSuccess, loadTripResultsFailure,
  loadTripResultById, loadTripResultByIdSuccess, loadTripResultByIdFailure,
} from './trip-results.actions';

export interface TripResultsState {
  results: TripResult[];
  /** Full gallery for the currently opened result; the list payload carries photos too,
   *  but a deep link lands here before the list has ever been fetched. */
  selected: TripResult | null;
  loading: boolean;
  error: string | null;
}

const initialState: TripResultsState = {
  results: [],
  selected: null,
  loading: false,
  error: null,
};

export const tripResultsFeature = createFeature({
  name: 'tripResults',
  reducer: createReducer(
    initialState,
    on(loadTripResults, (state) => ({ ...state, loading: true, error: null })),
    on(loadTripResultsSuccess, (state, { results }) => ({ ...state, results, loading: false })),
    on(loadTripResultsFailure, (state, { error }) => ({ ...state, loading: false, error })),

    on(loadTripResultById, (state) => ({ ...state, selected: null, loading: true, error: null })),
    on(loadTripResultByIdSuccess, (state, { result }) => ({ ...state, selected: result, loading: false })),
    on(loadTripResultByIdFailure, (state, { error }) => ({ ...state, loading: false, error }))
  ),
});

export const {
  name: tripResultsFeatureName,
  reducer: tripResultsReducer,
  selectTripResultsState,
  selectResults: selectAllTripResults,
  selectSelected: selectSelectedTripResult,
  selectLoading: selectTripResultsIsLoading,
  selectError: selectTripResultsError,
} = tripResultsFeature;
