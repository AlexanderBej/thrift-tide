import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

import { readUserProfile, upsertUserStartDay } from '../../api/services/settings.service';
import { DEFAULT_START_DAY } from '../../api/models/month-doc';

type SettingsState = {
  startDay: number; // 1..28
  status: 'idle' | 'loading' | 'ready' | 'error';
  error?: string;
};

const initialState: SettingsState = {
  startDay: 1,
  status: 'idle',
};

export const loadSettings = createAsyncThunk('settings/load', async ({ uid }: { uid: string }) => {
  const profile = await readUserProfile(uid);
  return { startDay: profile?.startDay ?? DEFAULT_START_DAY };
});

export const saveStartDay = createAsyncThunk(
  'settings/saveStartDay',
  async ({ uid, startDay }: { uid: string; startDay: number }) => {
    await upsertUserStartDay(uid, startDay);
    return { startDay };
  },
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setStartDayLocal(state, action: PayloadAction<number>) {
      // Optional immediate local update (optimistic)
      state.startDay = action.payload;
    },
  },
  extraReducers: (b) => {
    b.addCase(loadSettings.pending, (s) => {
      s.status = 'loading';
      s.error = undefined;
    });
    b.addCase(loadSettings.fulfilled, (s, { payload }) => {
      s.status = 'ready';
      s.startDay = payload.startDay;
    });
    b.addCase(loadSettings.rejected, (s, a) => {
      s.status = 'error';
      s.error = a.error.message ?? 'Failed to load settings';
    });

    b.addCase(saveStartDay.fulfilled, (s, { payload }) => {
      s.startDay = payload.startDay;
    });
  },
});

export const { setStartDayLocal } = settingsSlice.actions;
export default settingsSlice.reducer;
