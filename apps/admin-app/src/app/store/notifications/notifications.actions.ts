import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const NotificationsActions = createActionGroup({
  source: 'Notifications',
  events: {
    'Increment': props<{ notificationType: 'requests' | 'messages' }>(),
    'Reset Requests': emptyProps(),
    'Reset Messages': emptyProps(),
  },
});
