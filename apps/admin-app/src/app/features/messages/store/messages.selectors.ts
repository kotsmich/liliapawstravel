import { createSelector } from '@ngrx/store';
import { selectMessagesState } from './messages.reducer';

export const selectAllMessages = createSelector(selectMessagesState, (s) => s.messages);
export const selectMessagesIsLoading = createSelector(selectMessagesState, (s) => s.loading);
export const selectUnreadCount = createSelector(
  selectAllMessages,
  (messages) => messages.filter((m) => !m.isRead).length,
);
