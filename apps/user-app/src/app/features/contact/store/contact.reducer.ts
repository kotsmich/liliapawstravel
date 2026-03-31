import { createFeature, createReducer, on } from '@ngrx/store';
import { ContactSubmission } from '@models/lib/contact-form.model';
import { submitContact, submitContactSuccess, submitContactFailure, resetContact } from './contact.actions';

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
    on(submitContact, (s) => ({ ...s, loading: true, success: false, error: null })),
    on(submitContactSuccess, (s, { submission }) => ({
      ...s,
      lastSubmission: submission,
      loading: false,
      success: true,
    })),
    on(submitContactFailure, (s, { error }) => ({ ...s, loading: false, error })),
    on(resetContact, (s) => ({ ...s, loading: false, success: false, error: null }))
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
