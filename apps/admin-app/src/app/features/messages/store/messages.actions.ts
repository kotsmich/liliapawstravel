import { createAction, props } from '@ngrx/store';
import { ContactSubmission } from '@models/lib/contact-form.model';

export const loadMessages = createAction('[Messages] Load Messages');
export const loadMessagesSuccess = createAction('[Messages] Load Messages Success', props<{ messages: ContactSubmission[] }>());
export const loadMessagesFailure = createAction('[Messages] Load Messages Failure', props<{ error: string }>());

export const loadMessageById = createAction('[Messages] Load Message By Id', props<{ id: string }>());
export const loadMessageByIdSuccess = createAction('[Messages] Load Message By Id Success', props<{ message: ContactSubmission }>());
export const loadMessageByIdFailure = createAction('[Messages] Load Message By Id Failure', props<{ error: string }>());

export const deleteMessage = createAction('[Messages] Delete Message', props<{ id: string }>());
export const deleteMessageSuccess = createAction('[Messages] Delete Message Success', props<{ id: string }>());
export const deleteMessageFailure = createAction('[Messages] Delete Message Failure', props<{ error: string }>());

export const markAsRead = createAction('[Messages] Mark As Read', props<{ id: string }>());
export const addMessageFromSocket = createAction('[Messages] Add Message From Socket', props<{ message: ContactSubmission }>());
