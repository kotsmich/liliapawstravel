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
    on(loadMessages, (state) => ({ ...state, loading: true, error: null })),
    on(loadMessagesSuccess, (state, { messages }) => ({ ...state, messages, loading: false })),
    on(loadMessagesFailure, (state, { error }) => ({ ...state, loading: false, error })),
    on(loadMessageById, (state) => ({ ...state, loading: true })),
    on(loadMessageByIdSuccess, (state, { message }) => ({
      ...state,
      selectedMessage: message,
      messages: state.messages.map((existing) => (existing.id === message.id ? message : existing)),
      loading: false,
    })),
    on(loadMessageByIdFailure, (state, { error }) => ({ ...state, loading: false, error })),
    on(deleteMessage, (state) => ({ ...state, loading: true })),
    on(deleteMessageSuccess, (state, { id }) => ({
      ...state,
      messages: state.messages.filter((message) => message.id !== id),
      selectedMessage: state.selectedMessage?.id === id ? null : state.selectedMessage,
      loading: false,
    })),
    on(deleteMessageFailure, (state, { error }) => ({ ...state, loading: false, error })),
    on(markAsRead, (state, { id }) => ({
      ...state,
      messages: state.messages.map((message) => (message.id === id ? { ...message, isRead: true } : message)),
    })),
    on(addMessageFromSocket, (state, { message }) => ({
      ...state,
      messages: [message, ...state.messages],
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
