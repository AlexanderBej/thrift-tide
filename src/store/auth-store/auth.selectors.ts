import { RootState } from '../store';

export const selectAuthUser = (state: RootState) => state.auth.user;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthUserId = (state: RootState) => state.auth.user?.uuid;
