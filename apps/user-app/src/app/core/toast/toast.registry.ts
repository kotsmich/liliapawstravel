import { ActionCreator } from '@ngrx/store';
import { TranslocoService } from '@jsverse/transloco';
import { submitRequestSuccess } from '@user/features/trip-request/store';
import {
  wsRequestApproved,
  wsRequestRejected,
  httpConnectionError,
  httpServerError,
  dogUploadFailed,
} from './toast.actions';

export interface ToastPayload {
  severity: 'success' | 'info' | 'warn' | 'error';
  summary: string;
  detail?: string;
  life?: number;
}

export type ToastFactory<TAction = unknown> = (action: TAction, transloco: TranslocoService) => ToastPayload;

function register<TAction extends ActionCreator>(
  action: TAction,
  factory: ToastFactory<ReturnType<TAction>>,
): Record<string, ToastFactory> {
  return { [action.type]: factory as ToastFactory };
}

export const TOAST_REGISTRY: Record<string, ToastFactory> = {
  ...register(submitRequestSuccess, (_action, transloco) => ({
    severity: 'success',
    summary: transloco.translate('toasts.requestSubmitted.summary'),
    detail: transloco.translate('toasts.requestSubmitted.detail'),
    life: 5000,
  })),
  ...register(wsRequestApproved, (_action, transloco) => ({
    severity: 'success',
    summary: transloco.translate('toasts.requestApproved.summary'),
    detail: transloco.translate('toasts.requestApproved.detail'),
    life: 6000,
  })),
  ...register(wsRequestRejected, (_action, transloco) => ({
    severity: 'warn',
    summary: transloco.translate('toasts.requestRejected.summary'),
    detail: transloco.translate('toasts.requestRejected.detail'),
    life: 6000,
  })),
  ...register(httpConnectionError, (_action, transloco) => ({
    severity: 'error',
    summary: transloco.translate('toasts.connectionError.summary'),
    detail: transloco.translate('toasts.connectionError.detail'),
  })),
  ...register(httpServerError, (_action, transloco) => ({
    severity: 'error',
    summary: transloco.translate('toasts.serverError.summary'),
    detail: transloco.translate('toasts.serverError.detail'),
  })),
  ...register(dogUploadFailed, (_action, transloco) => ({
    severity: 'warn',
    summary: transloco.translate('tripRequest.uploadFailedTitle'),
    detail: transloco.translate('tripRequest.uploadFailedDetail'),
  })),
};
