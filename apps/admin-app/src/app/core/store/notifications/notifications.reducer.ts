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
    on(increment, (state, { notificationType }) => ({
      ...state,
      requestsCount: notificationType === 'requests' ? state.requestsCount + 1 : state.requestsCount,
      messagesCount: notificationType === 'messages' ? state.messagesCount + 1 : state.messagesCount,
    })),
    on(resetRequests, (state) => ({ ...state, requestsCount: 0 })),
    on(resetMessages, (state) => ({ ...state, messagesCount: 0 })),
  ),
});

export const {
  name: notificationsFeatureName,
  reducer: notificationsReducer,
  selectNotificationsState,
  selectRequestsCount,
  selectMessagesCount,
} = notificationsFeature;
