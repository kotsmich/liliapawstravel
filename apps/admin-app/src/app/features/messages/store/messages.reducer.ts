import { createFeature, createReducer, on } from '@ngrx/store';
import { ContactSubmission } from '@models/lib/contact-form.model';
import {
  loadMessages, loadMessagesSuccess, loadMessagesFailure,
  loadMessageById, loadMessageByIdSuccess, loadMessageByIdFailure,
  deleteMessage, deleteMessageSuccess, deleteMessageFailure,
  markAsRead, addMessageFromSocket,
} from './messages.actions';

export interface MessagesState {
  messages: ContactSubmission[];
  selectedMessage: ContactSubmission | null;
  loading: boolean;
  error: string | null;
}

const initialState: MessagesState = {
  messages: [],
  selectedMessage: null,
  loading: false,
  error: null,
};

export const messagesFeature = createFeature({
  name: 'messages',
  reducer: createReducer(
    initialState,
    on(loadMessages, (s) => ({ ...s, loading: true, error: null })),
    on(loadMessagesSuccess, (s, { messages }) => ({ ...s, messages, loading: false })),
    on(loadMessagesFailure, (s, { error }) => ({ ...s, loading: false, error })),
    on(loadMessageById, (s) => ({ ...s, loading: true })),
    on(loadMessageByIdSuccess, (s, { message }) => ({
      ...s,
      selectedMessage: message,
      messages: s.messages.map((m) => (m.id === message.id ? message : m)),
      loading: false,
    })),
    on(loadMessageByIdFailure, (s, { error }) => ({ ...s, loading: false, error })),
    on(deleteMessage, (s) => ({ ...s, loading: true })),
    on(deleteMessageSuccess, (s, { id }) => ({
      ...s,
      messages: s.messages.filter((m) => m.id !== id),
      selectedMessage: s.selectedMessage?.id === id ? null : s.selectedMessage,
      loading: false,
    })),
    on(deleteMessageFailure, (s, { error }) => ({ ...s, loading: false, error })),
    on(markAsRead, (s, { id }) => ({
      ...s,
      messages: s.messages.map((m) => (m.id === id ? { ...m, isRead: true } : m)),
    })),
    on(addMessageFromSocket, (s, { message }) => ({
      ...s,
      messages: [message, ...s.messages],
    })),
  ),
});

export const {
  name: messagesFeatureName,
  reducer: messagesReducer,
  selectMessagesState,
  selectMessages,
  selectSelectedMessage,
  selectLoading: selectMessagesLoading,
  selectError: selectMessagesError,
} = messagesFeature;
