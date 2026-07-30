import { createSelector } from '@ngrx/store';
import { adapter, selectTripResultsState } from './trip-results.reducer';

const { selectAll: selectAllTripResults, selectEntities: selectTripResultEntities } =
  adapter.getSelectors(selectTripResultsState);

export { selectAllTripResults, selectTripResultEntities };

export const selectTripResultsIsLoading = createSelector(selectTripResultsState, (s) => s.loading);
export const selectTripResultsIsMutating = createSelector(selectTripResultsState, (s) => s.mutating);
export const selectTripResultsError = createSelector(selectTripResultsState, (s) => s.error);
