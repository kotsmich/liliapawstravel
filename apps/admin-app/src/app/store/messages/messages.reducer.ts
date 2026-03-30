import { createFeature, createReducer, on } from '@ngrx/store';
import { ContactSubmission } from '@models/lib/contact-form.model';
import { MessagesActions } from './messages.actions';

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
    on(MessagesActions.loadMessages, (s) => ({ ...s, loading: true, error: null })),
    on(MessagesActions.loadMessagesSuccess, (s, { messages }) => ({ ...s, messages, loading: false })),
    on(MessagesActions.loadMessagesFailure, (s, { error }) => ({ ...s, loading: false, error })),
    on(MessagesActions.loadMessageById, (s) => ({ ...s, loading: true })),
    on(MessagesActions.loadMessageByIdSuccess, (s, { message }) => ({
      ...s,
      selectedMessage: message,
      messages: s.messages.map((m) => (m.id === message.id ? message : m)),
      loading: false,
    })),
    on(MessagesActions.loadMessageByIdFailure, (s, { error }) => ({ ...s, loading: false, error })),
    on(MessagesActions.deleteMessage, (s) => ({ ...s, loading: true })),
    on(MessagesActions.deleteMessageSuccess, (s, { id }) => ({
      ...s,
      messages: s.messages.filter((m) => m.id !== id),
      selectedMessage: s.selectedMessage?.id === id ? null : s.selectedMessage,
      loading: false,
    })),
    on(MessagesActions.deleteMessageFailure, (s, { error }) => ({ ...s, loading: false, error })),
    on(MessagesActions.markAsRead, (s, { id }) => ({
      ...s,
      messages: s.messages.map((m) => (m.id === id ? { ...m, isRead: true } : m)),
    })),
    on(MessagesActions.addMessageFromSocket, (s, { message }) => ({
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
