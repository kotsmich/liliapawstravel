import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { ContactSubmission } from '@models/lib/contact-form.model';

export const MessagesActions = createActionGroup({
  source: 'Messages',
  events: {
    'Load Messages': emptyProps(),
    'Load Messages Success': props<{ messages: ContactSubmission[] }>(),
    'Load Messages Failure': props<{ error: string }>(),
    'Load Message By Id': props<{ id: string }>(),
    'Load Message By Id Success': props<{ message: ContactSubmission }>(),
    'Load Message By Id Failure': props<{ error: string }>(),
    'Delete Message': props<{ id: string }>(),
    'Delete Message Success': props<{ id: string }>(),
    'Delete Message Failure': props<{ error: string }>(),
    'Mark As Read': props<{ id: string }>(),
  },
});
