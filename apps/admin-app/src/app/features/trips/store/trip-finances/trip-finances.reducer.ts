import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createFeature, createReducer, on } from '@ngrx/store';
import { TripFinanceEntry } from '@models/lib/trip-finance.model';
import {
  loadTripFinances, loadTripFinancesSuccess, loadTripFinancesFailure,
  createTripFinanceEntry, createTripFinanceEntrySuccess, createTripFinanceEntryFailure,
  updateTripFinanceEntry, updateTripFinanceEntrySuccess, updateTripFinanceEntryFailure,
  deleteTripFinanceEntry, deleteTripFinanceEntrySuccess, deleteTripFinanceEntryFailure,
} from './trip-finances.actions';

export const adapter = createEntityAdapter<TripFinanceEntry>();

export interface TripFinancesState extends EntityState<TripFinanceEntry> {
  /** Only one trip's finances are held at a time; selectors return [] unless this matches. */
  loadedTripId: string | null;
  loading: boolean;
  /** Row key with an in-flight mutation, so only that row spins. */
  mutatingKey: string | null;
  error: string | null;
}

const initialState: TripFinancesState = adapter.getInitialState({
  loadedTripId: null,
  loading: false,
  mutatingKey: null,
  error: null,
});

export const tripFinancesFeature = createFeature({
  name: 'tripFinances',
  reducer: createReducer(
    initialState,
    // Drop the previous trip's rows immediately, so a slow load can never show
    // trip A's money under trip B's header.
    on(loadTripFinances, (state, { tripId }) =>
      adapter.removeAll({
        ...state,
        loadedTripId: state.loadedTripId === tripId ? tripId : null,
        loading: true,
        error: null,
      })
    ),
    on(loadTripFinancesSuccess, (state, { tripId, entries }) =>
      adapter.setAll(entries, { ...state, loadedTripId: tripId, loading: false })
    ),
    on(loadTripFinancesFailure, (state, { error }) => ({ ...state, loading: false, error })),

    on(createTripFinanceEntry, (state, { rowKey }) => ({ ...state, mutatingKey: rowKey, error: null })),
    on(createTripFinanceEntrySuccess, (state, { entry }) =>
      adapter.upsertOne(entry, { ...state, mutatingKey: null })
    ),
    on(createTripFinanceEntryFailure, (state, { error }) => ({ ...state, mutatingKey: null, error })),

    on(updateTripFinanceEntry, (state, { rowKey }) => ({ ...state, mutatingKey: rowKey, error: null })),
    on(updateTripFinanceEntrySuccess, (state, { entry }) =>
      adapter.upsertOne(entry, { ...state, mutatingKey: null })
    ),
    on(updateTripFinanceEntryFailure, (state, { error }) => ({ ...state, mutatingKey: null, error })),

    on(deleteTripFinanceEntry, (state, { rowKey }) => ({ ...state, mutatingKey: rowKey, error: null })),
    on(deleteTripFinanceEntrySuccess, (state, { id }) =>
      adapter.removeOne(id, { ...state, mutatingKey: null })
    ),
    on(deleteTripFinanceEntryFailure, (state, { error }) => ({ ...state, mutatingKey: null, error }))
  ),
});

export const {
  name: tripFinancesFeatureName,
  reducer: tripFinancesReducer,
  selectTripFinancesState,
} = tripFinancesFeature;
