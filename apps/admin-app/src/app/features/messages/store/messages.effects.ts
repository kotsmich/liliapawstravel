import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { extractError } from '@admin/shared/utils/extract-error';
import { MessagesService } from '@admin/services/messages.service';
import {
  loadMessages, loadMessagesSuccess, loadMessagesFailure,
  loadMessageById, loadMessageByIdSuccess, loadMessageByIdFailure,
  deleteMessage, deleteMessageSuccess, deleteMessageFailure,
} from './messages.actions';

@Injectable()
export class MessagesEffects {
  private readonly actions$ = inject(Actions);
  private readonly messagesService = inject(MessagesService);

  loadMessages$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadMessages),
      switchMap(() =>
        this.messagesService.getMessages().pipe(
          map((messages) => loadMessagesSuccess({ messages })),
          catchError((error) => of(loadMessagesFailure({ error: extractError(error) }))),
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
          catchError((error) => of(loadMessageByIdFailure({ error: extractError(error) }))),
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
          catchError((error) => of(deleteMessageFailure({ error: extractError(error) }))),
        ),
      ),
    ),
  );
}
