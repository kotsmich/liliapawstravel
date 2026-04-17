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
  setSelectedRequests, setSelectedTripId,
} from './requests.actions';

export interface RequestsState {
  requests: TripRequest[];
  selectedRequestIds: string[];
  selectedTripId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: RequestsState = {
  requests: [],
  selectedRequestIds: [],
  selectedTripId: null,
  loading: false,
  error: null,
};

export const requestsFeature = createFeature({
  name: 'requests',
  reducer: createReducer(
    initialState,
    on(loadRequests, (state) => ({ ...state, loading: true, error: null })),
    on(loadRequestsSuccess, (state, { requests }) => ({ ...state, requests, loading: false })),
    on(loadRequestsFailure, (state, { error }) => ({ ...state, loading: false, error })),
    on(approveRequest, (state) => ({ ...state, loading: true, error: null })),
    on(approveRequestSuccess, (state, { request }) => ({
      ...state,
      requests: state.requests.map((existing) => (existing.id === request.id ? request : existing)),
      loading: false,
    })),
    on(approveRequestFailure, (state, { error }) => ({ ...state, loading: false, error })),
    on(rejectRequest, (state) => ({ ...state, loading: true, error: null })),
    on(rejectRequestSuccess, (state, { request }) => ({
      ...state,
      requests: state.requests.map((existing) => (existing.id === request.id ? request : existing)),
      loading: false,
    })),
    on(rejectRequestFailure, (state, { error }) => ({ ...state, loading: false, error })),
    on(deleteRequest, (state) => ({ ...state, loading: true, error: null })),
    on(deleteRequestSuccess, (state, { requestId }) => ({
      ...state,
      requests: state.requests.filter((request) => request.id !== requestId),
      loading: false,
    })),
    on(deleteRequestFailure, (state, { error }) => ({ ...state, loading: false, error })),
    on(addRequestFromSocket, (state, { request }) => ({
      ...state,
      requests: [request, ...state.requests],
    })),
    on(requestUpdatedFromSocket, (state, { request }) => ({
      ...state,
      requests: state.requests.map((existing) => (existing.id === request.id ? request : existing)),
    })),
    on(bulkApproveRequests, bulkRejectRequests, (state) => ({ ...state, loading: true, error: null })),
    on(bulkApproveRequestsSuccess, bulkRejectRequestsSuccess, (state) => ({ ...state, loading: false, selectedRequestIds: [] })),
    on(bulkApproveRequestsFailure, bulkRejectRequestsFailure, (state, { error }) => ({ ...state, loading: false, error })),
    on(setSelectedRequests, (state, { ids }) => ({ ...state, selectedRequestIds: ids })),
    on(setSelectedTripId, (state, { tripId }) => ({ ...state, selectedTripId: tripId })),
    on(updateRequestNote, (state) => ({ ...state })),
    on(updateRequestNoteSuccess, (state, { request }) => ({
      ...state,
      requests: state.requests.map((existing) => (existing.id === request.id ? request : existing)),
    })),
    on(updateRequestNoteFailure, (state, { error }) => ({ ...state, error })),
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
