import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

import {
  readUserProfile,
  upsertAppLanguage,
  upsertAppTheme,
  upsertUserStartDay,
} from '../../api/services/settings.service';
import { DEFAULT_START_DAY } from '../../api/models/month-doc';
import { clamp } from '../../utils/services.util';
import { DEFAULT_LANGUAGE, DEFAULT_THEME, Language, Theme } from '../../api/types/settings.types';

type SettingsState = {
  startDay: number; // 1..28
  language: Language;
  theme: Theme | null;
  status: 'idle' | 'loading' | 'ready' | 'error';
  error?: string;
};

const initialState: SettingsState = {
  startDay: DEFAULT_START_DAY,
  status: 'idle',
  theme: null,
  language: 'en',
};

export const loadSettings = createAsyncThunk(
  'settings/load',
  async ({ uid }: { uid: string }, { dispatch, rejectWithValue }) => {
    try {
      const profile = await readUserProfile(uid);
      dispatch(setLanguage(profile?.language ?? DEFAULT_LANGUAGE));
      dispatch(setStartDayLocal(profile?.startDay ?? DEFAULT_START_DAY));
      dispatch(themeUpdated(profile?.theme ?? DEFAULT_THEME));
      return {
        startDay: profile?.startDay ?? DEFAULT_START_DAY,
        language: profile?.language ?? DEFAULT_LANGUAGE,
        theme: profile?.theme ?? DEFAULT_THEME,
      };
    } catch (error) {
      toast.error('Failed to load settings!');
      return rejectWithValue(error);
    }
  },
);

export const saveStartDay = createAsyncThunk(
  'settings/saveStartDay',
  async ({ uid, startDay }: { uid: string; startDay: number }, { rejectWithValue }) => {
    try {
      await upsertUserStartDay(uid, clamp(startDay));
      toast.success('Start day changed successfuly!');
      return { startDay };
    } catch (error) {
      toast.error('Failed to update start day!');
      return rejectWithValue(error);
    }
  },
);

export const saveLanguageThunk = createAsyncThunk(
  'settings/saveLanguage',
  async ({ uid, language }: { uid: string; language: 'en' | 'ro' }, { rejectWithValue }) => {
    try {
      await upsertAppLanguage(uid, language);
      toast.success('Language changed successfuly!');
      return { language };
    } catch (error) {
      toast.error('Failed to update language');
      return rejectWithValue(error);
    }
  },
);

export const setAppThemeThunk = createAsyncThunk(
  'settings/setAppTheme',
  async ({ uid, theme }: { uid: string; theme: Theme }, { rejectWithValue }) => {
    try {
      await upsertAppTheme(uid, theme);
      toast.success('Theme changed successfuly!');
      return { theme };
    } catch (error) {
      toast.error('Failed to change theme');
      return rejectWithValue(error);
    }
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
    setLanguage(state, action: PayloadAction<Language>) {
      state.language = action.payload;
      localStorage.setItem('i18nextLng', action.payload); // sync detector cache
    },
    themeUpdated(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
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

    b.addCase(saveStartDay.pending, (s) => {
      s.error = undefined;
      s.status = 'loading';
    });
    b.addCase(saveStartDay.fulfilled, (s, { payload }) => {
      s.startDay = payload.startDay;
      s.status = 'ready';
    });
    b.addCase(saveStartDay.rejected, (s, a) => {
      s.status = 'error';
      s.error = a.error.message ?? 'Failed to save start day';
    });

    b.addCase(saveLanguageThunk.pending, (s) => {
      s.error = undefined;
      s.status = 'loading';
    });
    b.addCase(saveLanguageThunk.fulfilled, (s, { payload }) => {
      s.language = payload.language;
      s.status = 'ready';
    });
    b.addCase(saveLanguageThunk.rejected, (s, a) => {
      s.status = 'error';
      s.error = a.error.message ?? 'Failed to change language';
    });
  },
});

export const { setStartDayLocal, setLanguage, themeUpdated } = settingsSlice.actions;
export default settingsSlice.reducer;
