import { createSelector } from '@ngrx/store';
import { selectRequestsCount, selectMessagesCount } from './notifications.reducer';

export const selectTotalCount = createSelector(
  selectRequestsCount,
  selectMessagesCount,
  (requests, messages) => requests + messages,
);
