import { createAction, props } from '@ngrx/store';

export const increment = createAction(
    '[Notifications] Increment',
    props<{ notificationType: 'requests' | 'messages' }>()
);
export const resetRequests = createAction(
    '[Notifications] Reset Requests'
);
export const resetMessages = createAction(
    '[Notifications] Reset Messages'
);
