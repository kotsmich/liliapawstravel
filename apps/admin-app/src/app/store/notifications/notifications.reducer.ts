import { createFeature, createReducer, on } from '@ngrx/store';
import { NotificationsActions } from './notifications.actions';

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
    on(NotificationsActions.increment, (s, { notificationType }) => ({
      ...s,
      requestsCount: notificationType === 'requests' ? s.requestsCount + 1 : s.requestsCount,
      messagesCount: notificationType === 'messages' ? s.messagesCount + 1 : s.messagesCount,
    })),
    on(NotificationsActions.resetRequests, (s) => ({ ...s, requestsCount: 0 })),
    on(NotificationsActions.resetMessages, (s) => ({ ...s, messagesCount: 0 })),
  ),
});

export const {
  name: notificationsFeatureName,
  reducer: notificationsReducer,
  selectNotificationsState,
  selectRequestsCount,
  selectMessagesCount,
} = notificationsFeature;
