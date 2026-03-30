import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { MessagesService } from '@admin/services/messages.service';
import { MessagesActions } from './messages.actions';

@Injectable()
export class MessagesEffects {
  loadMessages$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MessagesActions.loadMessages),
      switchMap(() =>
        this.messagesService.getMessages().pipe(
          map((messages) => MessagesActions.loadMessagesSuccess({ messages })),
          catchError((error) => of(MessagesActions.loadMessagesFailure({ error: error.message }))),
        ),
      ),
    ),
  );

  loadMessageById$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MessagesActions.loadMessageById),
      switchMap(({ id }) =>
        this.messagesService.getMessageById(id).pipe(
          map((message) => MessagesActions.loadMessageByIdSuccess({ message })),
          catchError((error) => of(MessagesActions.loadMessageByIdFailure({ error: error.message }))),
        ),
      ),
    ),
  );

  deleteMessage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MessagesActions.deleteMessage),
      switchMap(({ id }) =>
        this.messagesService.deleteMessage(id).pipe(
          map(({ id: deletedId }) => MessagesActions.deleteMessageSuccess({ id: deletedId })),
          catchError((error) => of(MessagesActions.deleteMessageFailure({ error: error.message }))),
        ),
      ),
    ),
  );

  constructor(private actions$: Actions, private messagesService: MessagesService) {}
}
