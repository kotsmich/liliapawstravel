import { createFeature, createReducer, on } from '@ngrx/store';
import { AdminUser } from '@models/lib/admin-user.model';
import {
  loadUsers, loadUsersSuccess, loadUsersFailure,
  updateUser, updateUserSuccess, updateUserFailure,
  deleteUser, deleteUserSuccess, deleteUserFailure,
} from './users.actions';

export interface UsersState {
  users: AdminUser[];
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  loading: false,
  error: null,
};

export const usersFeature = createFeature({
  name: 'users',
  reducer: createReducer(
    initialState,
    on(loadUsers, (state) => ({ ...state, loading: true, error: null })),
    on(loadUsersSuccess, (state, { users }) => ({ ...state, users, loading: false })),
    on(loadUsersFailure, (state, { error }) => ({ ...state, loading: false, error })),
    on(updateUser, (state) => ({ ...state, error: null })),
    on(updateUserSuccess, (state, { user }) => ({
      ...state,
      users: state.users.map((u) => (u.id === user.id ? user : u)),
    })),
    on(updateUserFailure, (state, { error }) => ({ ...state, error })),
    on(deleteUser, (state) => ({ ...state, error: null })),
    on(deleteUserSuccess, (state, { id }) => ({
      ...state,
      users: state.users.filter((u) => u.id !== id),
    })),
    on(deleteUserFailure, (state, { error }) => ({ ...state, error }))
  ),
});

export const {
  name: usersFeatureName,
  reducer: usersReducer,
  selectUsersState,
  selectUsers,
  selectLoading: selectUsersLoading,
  selectError: selectUsersError,
} = usersFeature;
