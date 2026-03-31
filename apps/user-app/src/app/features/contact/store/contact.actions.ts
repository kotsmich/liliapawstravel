import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { ContactForm, ContactSubmission } from '@models/lib/contact-form.model';

export const ContactActions = createActionGroup({
  source: 'Contact',
  events: {
    'Submit Contact': props<{ form: ContactForm }>(),
    'Submit Contact Success': props<{ submission: ContactSubmission }>(),
    'Submit Contact Failure': props<{ error: string }>(),
    'Reset Contact': emptyProps(),
  },
});
