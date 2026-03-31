import { createAction, props } from '@ngrx/store';
import { ContactForm, ContactSubmission } from '@models/lib/contact-form.model';

export const submitContact = createAction('[Contact] Submit Contact', props<{ form: ContactForm }>());
export const submitContactSuccess = createAction('[Contact] Submit Contact Success', props<{ submission: ContactSubmission }>());
export const submitContactFailure = createAction('[Contact] Submit Contact Failure', props<{ error: string }>());
export const resetContact = createAction('[Contact] Reset Contact');
