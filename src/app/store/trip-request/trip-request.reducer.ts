import { createFeature, createReducer, on } from '@ngrx/store';
import { TripRequestSubmission } from '../../models';
import { TripRequestActions } from './trip-request.actions';

export interface TripRequestState {
  submissions: TripRequestSubmission[];
  loading: boolean;
  success: boolean;
  error: string | null;
}

const initialState: TripRequestState = {
  submissions: [],
  loading: false,
  success: false,
  error: null,
};

export const tripRequestFeature = createFeature({
  name: 'tripRequest',
  reducer: createReducer(
    initialState,
    on(TripRequestActions.submitTripRequest, (state) => ({
      ...state,
      loading: true,
      success: false,
      error: null,
    })),
    on(TripRequestActions.submitTripRequestSuccess, (state, { submission }) => ({
      ...state,
      submissions: [...state.submissions, submission],
      loading: false,
      success: true,
    })),
    on(TripRequestActions.submitTripRequestFailure, (state, { error }) => ({
      ...state,
      loading: false,
      success: false,
      error,
    })),
    on(TripRequestActions.resetTripRequest, (state) => ({
      ...state,
      loading: false,
      success: false,
      error: null,
    }))
  ),
});

export const {
  name: tripRequestFeatureName,
  reducer: tripRequestReducer,
  selectTripRequestState,
  selectSubmissions,
  selectLoading: selectTripRequestLoading,
  selectSuccess: selectTripRequestSuccess,
  selectError: selectTripRequestError,
} = tripRequestFeature;
