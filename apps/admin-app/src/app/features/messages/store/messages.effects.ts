import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { MessagesService } from '@admin/services/messages.service';
import {
  loadMessages, loadMessagesSuccess, loadMessagesFailure,
  loadMessageById, loadMessageByIdSuccess, loadMessageByIdFailure,
  deleteMessage, deleteMessageSuccess, deleteMessageFailure,
} from './messages.actions';

@Injectable()
export class MessagesEffects {
  loadMessages$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadMessages),
      switchMap(() =>
        this.messagesService.getMessages().pipe(
          map((messages) => loadMessagesSuccess({ messages })),
          catchError((error) => of(loadMessagesFailure({ error: error.message }))),
        ),
      ),
    ),
  );

  loadMessageById$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadMessageById),
      switchMap(({ id }) =>
        this.messagesService.getMessageById(id).pipe(
          map((message) => loadMessageByIdSuccess({ message })),
          catchError((error) => of(loadMessageByIdFailure({ error: error.message }))),
        ),
      ),
    ),
  );

  deleteMessage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteMessage),
      switchMap(({ id }) =>
        this.messagesService.deleteMessage(id).pipe(
          map(({ id: deletedId }) => deleteMessageSuccess({ id: deletedId })),
          catchError((error) => of(deleteMessageFailure({ error: error.message }))),
        ),
      ),
    ),
  );

  constructor(private actions$: Actions, private messagesService: MessagesService) {}
}
