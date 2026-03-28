import { createFeature, createReducer, on } from '@ngrx/store';
import { ContactSubmission } from '@myorg/models';
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
    on(ContactActions.submitContact, (s) => ({ ...s, loading: true, success: false, error: null })),
    on(ContactActions.submitContactSuccess, (s, { submission }) => ({
      ...s,
      lastSubmission: submission,
      loading: false,
      success: true,
    })),
    on(ContactActions.submitContactFailure, (s, { error }) => ({ ...s, loading: false, error })),
    on(ContactActions.resetContact, (s) => ({ ...s, loading: false, success: false, error: null }))
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
