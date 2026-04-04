import { ActionCreator } from '@ngrx/store';
import {
  deleteTripSuccess, deleteTripFailure,
  addTripFailure, updateTripSuccess, updateTripFailure,
  updateDogSuccess,
} from '@admin/features/trips/store';
import {
  approveRequestSuccess,
  rejectRequestSuccess,
  deleteRequestSuccess,
  bulkApproveRequestsSuccess, bulkApproveRequestsFailure,
  bulkRejectRequestsSuccess, bulkRejectRequestsFailure,
  updateRequestNoteSuccess, updateRequestNoteFailure,
  addRequestFromSocket,
} from '@admin/features/requests/store';
import { deleteMessageSuccess, addMessageFromSocket } from '@admin/features/messages/store';

export interface ToastPayload {
  severity: 'success' | 'info' | 'warn' | 'error';
  summary: string;
  detail?: string;
  life?: number;
}

function register<AC extends ActionCreator>(
  action: AC,
  factory: (action: ReturnType<AC>) => ToastPayload
): Record<string, (action: any) => ToastPayload> {
  return { [action.type]: factory };
}

export const TOAST_REGISTRY: Record<string, (action: any) => ToastPayload> = {
  // Trips
  ...register(deleteTripSuccess,
    () => ({ severity: 'success', summary: 'Deleted', detail: 'Trip deleted.' })),
  ...register(updateTripSuccess,
    () => ({ severity: 'success', summary: 'Saved', detail: 'Trip updated successfully.' })),
  ...register(addTripFailure,
    ({ error }) => ({ severity: 'error', summary: 'Error', detail: error })),
  ...register(updateTripFailure,
    ({ error }) => ({ severity: 'error', summary: 'Error', detail: error })),
  ...register(deleteTripFailure,
    ({ error }) => ({ severity: 'error', summary: 'Error', detail: error })),

  // Dogs
  ...register(updateDogSuccess,
    ({ dog }) => ({ severity: 'success', summary: 'Dog Updated', detail: `${dog.name} saved.` })),

  // Requests — single actions
  ...register(approveRequestSuccess,
    () => ({ severity: 'success', summary: 'Approved', detail: 'Request approved. Dogs added to trip.' })),
  ...register(rejectRequestSuccess,
    () => ({ severity: 'info', summary: 'Rejected', detail: 'Request has been rejected.' })),
  ...register(deleteRequestSuccess,
    () => ({ severity: 'info', summary: 'Deleted', detail: 'Request deleted.' })),

  // Requests — bulk
  ...register(bulkApproveRequestsSuccess,
    ({ succeeded, failed }) => failed.length === 0
      ? { severity: 'success', summary: 'Done', detail: `${succeeded.length} request(s) approved.` }
      : { severity: 'warn', summary: 'Partial success', detail: `${succeeded.length} approved, ${failed.length} failed.` }),
  ...register(bulkApproveRequestsFailure,
    ({ error }) => ({ severity: 'error', summary: 'Bulk action failed', detail: error })),
  ...register(bulkRejectRequestsSuccess,
    ({ succeeded, failed }) => failed.length === 0
      ? { severity: 'success', summary: 'Done', detail: `${succeeded.length} request(s) rejected.` }
      : { severity: 'warn', summary: 'Partial success', detail: `${succeeded.length} rejected, ${failed.length} failed.` }),
  ...register(bulkRejectRequestsFailure,
    ({ error }) => ({ severity: 'error', summary: 'Bulk action failed', detail: error })),

  // Requests — note
  ...register(updateRequestNoteSuccess,
    () => ({ severity: 'success', summary: 'Note saved', detail: 'Admin note has been saved.' })),
  ...register(updateRequestNoteFailure,
    ({ error }) => ({ severity: 'error', summary: 'Failed to save note', detail: error })),

  // Messages
  ...register(deleteMessageSuccess,
    () => ({ severity: 'success', summary: 'Deleted', detail: 'Message deleted.' })),

  // Socket events
  ...register(addRequestFromSocket,
    ({ request }) => ({ severity: 'info', summary: 'New Request', detail: `New request from ${request.requesterName}`, life: 5000 })),
  ...register(addMessageFromSocket,
    ({ message }) => ({ severity: 'info', summary: 'New Message', detail: `Message from ${message.name}`, life: 5000 })),
};
