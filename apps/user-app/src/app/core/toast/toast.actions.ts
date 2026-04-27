import { createAction, props } from '@ngrx/store';

export const wsRequestApproved = createAction('[Toast] WS Request Approved');
export const wsRequestRejected = createAction('[Toast] WS Request Rejected');

export const httpConnectionError = createAction('[Toast] HTTP Connection Error');
export const httpServerError = createAction(
  '[Toast] HTTP Server Error',
  props<{ status: number }>()
);

export const dogUploadFailed = createAction('[Toast] Dog Upload Failed');
