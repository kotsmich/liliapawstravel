import { createFeature, createReducer, on } from '@ngrx/store';
import { TripRequest } from '@models/lib/trip-request.model';
import { TripRequestActions } from './requests.actions';

export interface RequestsState {
  requests: TripRequest[];
  loading: boolean;
  error: string | null;
}

const initialState: RequestsState = {
  requests: [],
  loading: false,
  error: null,
};

export const requestsFeature = createFeature({
  name: 'requests',
  reducer: createReducer(
    initialState,
    on(TripRequestActions.loadRequests, (s) => ({ ...s, loading: true, error: null })),
    on(TripRequestActions.loadRequestsSuccess, (s, { requests }) => ({ ...s, requests, loading: false })),
    on(TripRequestActions.loadRequestsFailure, (s, { error }) => ({ ...s, loading: false, error })),
    on(TripRequestActions.approveRequest, (s) => ({ ...s, loading: true, error: null })),
    on(TripRequestActions.approveRequestSuccess, (s, { request }) => ({
      ...s,
      requests: s.requests.map((r) => (r.id === request.id ? request : r)),
      loading: false,
    })),
    on(TripRequestActions.approveRequestFailure, (s, { error }) => ({ ...s, loading: false, error })),
    on(TripRequestActions.updateRequestStatus, (s) => ({ ...s, loading: true, error: null })),
    on(TripRequestActions.updateRequestStatusSuccess, (s, { request }) => ({
      ...s,
      requests: s.requests.map((r) => (r.id === request.id ? request : r)),
      loading: false,
    })),
    on(TripRequestActions.updateRequestStatusFailure, (s, { error }) => ({ ...s, loading: false, error })),
    on(TripRequestActions.deleteRequest, (s) => ({ ...s, loading: true, error: null })),
    on(TripRequestActions.deleteRequestSuccess, (s, { requestId }) => ({
      ...s,
      requests: s.requests.filter((r) => r.id !== requestId),
      loading: false,
    })),
    on(TripRequestActions.deleteRequestFailure, (s, { error }) => ({ ...s, loading: false, error }))
  ),
});

export const {
  name: requestsFeatureName,
  reducer: requestsReducer,
  selectRequestsState,
  selectRequests,
  selectLoading: selectRequestsLoading,
  selectError: selectRequestsError,
} = requestsFeature;
