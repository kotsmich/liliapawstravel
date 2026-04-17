import { createSelector } from '@ngrx/store';
import { selectMessagesState } from './messages.reducer';

export const selectAllMessages = createSelector(selectMessagesState, (state) => state.messages);
export const selectMessagesIsLoading = createSelector(selectMessagesState, (state) => state.loading);
export const selectUnreadCount = createSelector(
  selectAllMessages,
  (messages) => messages.filter((message) => !message.isRead).length,
);
