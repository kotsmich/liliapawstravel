import { ActionCreator } from '@ngrx/store';
import { submitRequestSuccess } from '@user/features/trip-request/store';

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
  ...register(submitRequestSuccess,
    () => ({
      severity: 'success',
      summary: 'Request Submitted!',
      detail: "Your transport request has been submitted. We'll confirm within 24 hours. 🐾",
      life: 5000,
    })),
};
