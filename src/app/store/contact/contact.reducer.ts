import { createFeature, createReducer, on } from '@ngrx/store';
import { ContactSubmission } from '../../models';
import { ContactActions } from './contact.actions';

export interface ContactState {
  lastSubmission: ContactSubmission | null;
  loading: boolean;
  success: boolean;
  error: string | null;
}

const initialState: ContactState = {
  lastSubmission: null,
  loading: false,
  success: false,
  error: null,
};

export const contactFeature = createFeature({
  name: 'contact',
  reducer: createReducer(
    initialState,
    on(ContactActions.submitContact, (state) => ({
      ...state,
      loading: true,
      success: false,
      error: null,
    })),
    on(ContactActions.submitContactSuccess, (state, { submission }) => ({
      ...state,
      lastSubmission: submission,
      loading: false,
      success: true,
    })),
    on(ContactActions.submitContactFailure, (state, { error }) => ({
      ...state,
      loading: false,
      success: false,
      error,
    })),
    on(ContactActions.resetContact, (state) => ({
      ...state,
      loading: false,
      success: false,
      error: null,
    }))
  ),
});

export const {
  name: contactFeatureName,
  reducer: contactReducer,
  selectContactState,
  selectLastSubmission,
  selectLoading: selectContactLoading,
  selectSuccess: selectContactSuccess,
  selectError: selectContactError,
} = contactFeature;
