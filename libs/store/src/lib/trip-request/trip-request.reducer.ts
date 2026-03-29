import { createFeature, createReducer, on } from '@ngrx/store';
import { TripRequest } from '@myorg/models';
import { TripRequestActions } from './trip-request.actions';

export interface TripRequestState {
  lastRequest: TripRequest | null;
  requests: TripRequest[];
  loading: boolean;
  requestsLoading: boolean;
  success: boolean;
  error: string | null;
}

const initialState: TripRequestState = {
  lastRequest: null,
  requests: [],
  loading: false,
  requestsLoading: false,
  success: false,
  error: null,
};

export const tripRequestFeature = createFeature({
  name: 'tripRequest',
  reducer: createReducer(
    initialState,
    on(TripRequestActions.submitRequest, (s) => ({ ...s, loading: true, success: false, error: null })),
    on(TripRequestActions.submitRequestSuccess, (s, { request }) => ({
      ...s, lastRequest: request, loading: false, success: true,
    })),
    on(TripRequestActions.submitRequestFailure, (s, { error }) => ({ ...s, loading: false, error })),
    on(TripRequestActions.resetRequest, (s) => ({ ...s, loading: false, success: false, error: null })),
    on(TripRequestActions.loadRequests, (s) => ({ ...s, requestsLoading: true, error: null })),
    on(TripRequestActions.loadRequestsSuccess, (s, { requests }) => ({ ...s, requests, requestsLoading: false })),
    on(TripRequestActions.loadRequestsFailure, (s, { error }) => ({ ...s, requestsLoading: false, error })),
    on(TripRequestActions.approveRequest, (s) => ({ ...s, requestsLoading: true, error: null })),
    on(TripRequestActions.approveRequestSuccess, (s, { request }) => ({
      ...s,
      requests: s.requests.map((r) => (r.id === request.id ? request : r)),
      requestsLoading: false,
    })),
    on(TripRequestActions.approveRequestFailure, (s, { error }) => ({ ...s, requestsLoading: false, error })),
    on(TripRequestActions.updateRequestStatus, (s) => ({ ...s, requestsLoading: true, error: null })),
    on(TripRequestActions.updateRequestStatusSuccess, (s, { request }) => ({
      ...s,
      requests: s.requests.map((r) => (r.id === request.id ? request : r)),
      requestsLoading: false,
    })),
    on(TripRequestActions.updateRequestStatusFailure, (s, { error }) => ({ ...s, requestsLoading: false, error })),
    on(TripRequestActions.deleteRequest, (s) => ({ ...s, requestsLoading: true, error: null })),
    on(TripRequestActions.deleteRequestSuccess, (s, { requestId }) => ({
      ...s,
      requests: s.requests.filter((r) => r.id !== requestId),
      requestsLoading: false,
    })),
    on(TripRequestActions.deleteRequestFailure, (s, { error }) => ({ ...s, requestsLoading: false, error }))
  ),
});

export const {
  name: tripRequestFeatureName,
  reducer: tripRequestReducer,
  selectTripRequestState,
  selectLastRequest,
  selectRequests,
  selectLoading: selectTripRequestLoading,
  selectRequestsLoading,
  selectSuccess: selectTripRequestSuccess,
  selectError: selectTripRequestError,
} = tripRequestFeature;
