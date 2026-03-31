import { createAction, props } from '@ngrx/store';

export const selectDate = createAction('[Calendar] Select Date', props<{ date: string }>());
export const clearDate = createAction('[Calendar] Clear Date');
