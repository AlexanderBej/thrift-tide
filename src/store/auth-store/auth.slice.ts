import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MinimalUser } from '../../api/models/user';

interface AuthState {
  user: null | MinimalUser;
  loading: boolean;
  status: 'idle' | 'authenticated' | 'unauthenticated';
}

const initialState: AuthState = {
  user: null,
  loading: false,
  status: 'idle',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // This action can be used to rehydrate the token on app load
    // setToken: (state, action: PayloadAction<string>) => {
    //   state.token = action.payload;
    // },
    userSignedIn(state, action: PayloadAction<MinimalUser>) {
      state.status = 'authenticated';
      state.user = action.payload;
      state.loading = false;
    },
    userSignedOut(state) {
      state.status = 'unauthenticated';
      state.user = null;
    },
    authLoading(state) {
      state.loading = true;
    },
  },
});

export const { userSignedIn, userSignedOut, authLoading } = authSlice.actions;
export default authSlice.reducer;
