import { createAction, props } from '@ngrx/store';
import { TripRequest } from '@models/lib/trip-request.model';

export const loadRequests = createAction('[TripRequest] Load Requests');
export const loadRequestsSuccess = createAction(
  '[TripRequest] Load Requests Success',
  props<{ requests: TripRequest[] }>()
);
export const loadRequestsFailure = createAction(
  '[TripRequest] Load Requests Failure',
  props<{ error: string }>()
);

export const approveRequest = createAction(
  '[TripRequest] Approve Request',
  props<{ requestId: string; tripId: string }>()
);
export const approveRequestSuccess = createAction(
  '[TripRequest] Approve Request Success',
  props<{ request: TripRequest }>()
);
export const approveRequestFailure = createAction(
  '[TripRequest] Approve Request Failure',
  props<{ error: string }>()
);

export const rejectRequest = createAction(
  '[TripRequest] Reject Request',
  props<{ id: string }>()
);
export const rejectRequestSuccess = createAction(
  '[TripRequest] Reject Request Success',
  props<{ request: TripRequest }>()
);
export const rejectRequestFailure = createAction(
  '[TripRequest] Reject Request Failure',
  props<{ error: string }>()
);

export const deleteRequest = createAction(
  '[TripRequest] Delete Request',
  props<{ requestId: string }>()
);
export const deleteRequestSuccess = createAction(
  '[TripRequest] Delete Request Success',
  props<{ requestId: string }>()
);
export const deleteRequestFailure = createAction(
  '[TripRequest] Delete Request Failure',
  props<{ error: string }>()
);

export const addRequestFromSocket = createAction(
  '[TripRequest] Add Request From Socket',
  props<{ request: TripRequest }>()
);

export const requestUpdatedFromSocket = createAction(
  '[TripRequest] Request Updated From Socket',
  props<{ request: TripRequest }>()
);

export const bulkApproveRequests = createAction(
  '[TripRequest] Bulk Approve Requests',
  props<{ ids: string[] }>()
);
export const bulkApproveRequestsSuccess = createAction(
  '[TripRequest] Bulk Approve Requests Success',
  props<{ succeeded: string[]; failed: Array<{ id: string; reason: string }> }>()
);
export const bulkApproveRequestsFailure = createAction(
  '[TripRequest] Bulk Approve Requests Failure',
  props<{ error: string }>()
);

export const bulkRejectRequests = createAction(
  '[TripRequest] Bulk Reject Requests',
  props<{ ids: string[] }>()
);
export const bulkRejectRequestsSuccess = createAction(
  '[TripRequest] Bulk Reject Requests Success',
  props<{ succeeded: string[]; failed: Array<{ id: string; reason: string }> }>()
);
export const bulkRejectRequestsFailure = createAction(
  '[TripRequest] Bulk Reject Requests Failure',
  props<{ error: string }>()
);

export const updateRequestNote = createAction(
  '[TripRequest] Update Request Note',
  props<{ id: string; note: string }>()
);
export const updateRequestNoteSuccess = createAction(
  '[TripRequest] Update Request Note Success',
  props<{ request: TripRequest }>()
);
export const updateRequestNoteFailure = createAction(
  '[TripRequest] Update Request Note Failure',
  props<{ error: string }>()
);

export const setSelectedRequests = createAction(
  '[TripRequest] Set Selected Requests',
  props<{ requests: TripRequest[] }>()
);

export const setSelectedTripId = createAction(
  '[TripRequest] Set Selected Trip Id',
  props<{ tripId: string | null }>()
);
