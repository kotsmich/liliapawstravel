import { createFeature, createReducer, on } from '@ngrx/store';
import { increment, resetRequests, resetMessages } from './notifications.actions';

export interface NotificationsState {
  requestsCount: number;
  messagesCount: number;
}

const initialState: NotificationsState = {
  requestsCount: 0,
  messagesCount: 0,
};

export const notificationsFeature = createFeature({
  name: 'notifications',
  reducer: createReducer(
    initialState,
    on(increment, (s, { notificationType }) => ({
      ...s,
      requestsCount: notificationType === 'requests' ? s.requestsCount + 1 : s.requestsCount,
      messagesCount: notificationType === 'messages' ? s.messagesCount + 1 : s.messagesCount,
    })),
    on(resetRequests, (s) => ({ ...s, requestsCount: 0 })),
    on(resetMessages, (s) => ({ ...s, messagesCount: 0 })),
  ),
});

export const {
  name: notificationsFeatureName,
  reducer: notificationsReducer,
  selectNotificationsState,
  selectRequestsCount,
  selectMessagesCount,
} = notificationsFeature;
