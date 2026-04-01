import { createFeature, createReducer, on } from '@ngrx/store';
import { TripRequest } from '@models/lib/trip-request.model';
import {
  loadRequests, loadRequestsSuccess, loadRequestsFailure,
  approveRequest, approveRequestSuccess, approveRequestFailure,
  rejectRequest, rejectRequestSuccess, rejectRequestFailure,
  deleteRequest, deleteRequestSuccess, deleteRequestFailure,
  addRequestFromSocket, requestUpdatedFromSocket,
  bulkApproveRequests, bulkApproveRequestsSuccess, bulkApproveRequestsFailure,
  bulkRejectRequests, bulkRejectRequestsSuccess, bulkRejectRequestsFailure,
  updateRequestNote, updateRequestNoteSuccess, updateRequestNoteFailure,
} from './requests.actions';

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
    on(loadRequests, (s) => ({ ...s, loading: true, error: null })),
    on(loadRequestsSuccess, (s, { requests }) => ({ ...s, requests, loading: false })),
    on(loadRequestsFailure, (s, { error }) => ({ ...s, loading: false, error })),
    on(approveRequest, (s) => ({ ...s, loading: true, error: null })),
    on(approveRequestSuccess, (s, { request }) => ({
      ...s,
      requests: s.requests.map((r) => (r.id === request.id ? request : r)),
      loading: false,
    })),
    on(approveRequestFailure, (s, { error }) => ({ ...s, loading: false, error })),
    on(rejectRequest, (s) => ({ ...s, loading: true, error: null })),
    on(rejectRequestSuccess, (s, { request }) => ({
      ...s,
      requests: s.requests.map((r) => (r.id === request.id ? request : r)),
      loading: false,
    })),
    on(rejectRequestFailure, (s, { error }) => ({ ...s, loading: false, error })),
    on(deleteRequest, (s) => ({ ...s, loading: true, error: null })),
    on(deleteRequestSuccess, (s, { requestId }) => ({
      ...s,
      requests: s.requests.filter((r) => r.id !== requestId),
      loading: false,
    })),
    on(deleteRequestFailure, (s, { error }) => ({ ...s, loading: false, error })),
    on(addRequestFromSocket, (s, { request }) => ({
      ...s,
      requests: [request, ...s.requests],
    })),
    on(requestUpdatedFromSocket, (s, { request }) => ({
      ...s,
      requests: s.requests.map((r) => (r.id === request.id ? request : r)),
    })),
    on(bulkApproveRequests, bulkRejectRequests, (s) => ({ ...s, loading: true, error: null })),
    on(bulkApproveRequestsSuccess, bulkRejectRequestsSuccess, (s) => ({ ...s, loading: false })),
    on(bulkApproveRequestsFailure, bulkRejectRequestsFailure, (s, { error }) => ({ ...s, loading: false, error })),
    on(updateRequestNote, (s) => ({ ...s })),
    on(updateRequestNoteSuccess, (s, { request }) => ({
      ...s,
      requests: s.requests.map((r) => (r.id === request.id ? request : r)),
    })),
    on(updateRequestNoteFailure, (s, { error }) => ({ ...s, error })),
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
