import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

import {
  completeOnboarding,
  readUserProfile,
  upsertAppLanguage,
  upsertAppTheme,
  upsertCurrency,
  upsertDefaultPercents,
  upsertUserStartDay,
} from '../../api/services/settings.service';
import { DEFAULT_START_DAY } from '../../api/models/month-doc';
import { clamp } from '../../utils/services.util';
import {
  Currency,
  DEFAULT_CURRENCY,
  DEFAULT_LANGUAGE,
  DEFAULT_THEME,
  Language,
  Theme,
} from '../../api/types/settings.types';
import { DEFAULT_PERCENTS, PercentTriple } from '../../api/types/percent.types';
import { OnboardingData } from '../../api/models/user';
import { createAppAsyncThunk, StoreStatus } from '../../api/types/store.types';
import { setPercentsThunk } from '../budget-store/budget.slice';

type SettingsState = {
  startDay: number; // 1..28
  language: Language;
  theme: Theme | null;
  currency: Currency;
  defaultPercents: PercentTriple;
  onboardingCompleted: boolean;
  status: StoreStatus;
  bootStatus: StoreStatus;
  error?: string;
};

const initialState: SettingsState = {
  startDay: DEFAULT_START_DAY,
  status: 'idle',
  bootStatus: 'idle',
  theme: null,
  currency: 'EUR',
  onboardingCompleted: false,
  defaultPercents: DEFAULT_PERCENTS,
  language: 'en',
};

export const loadSettings = createAppAsyncThunk<
  { startDay: number; language: Language; theme: Theme },
  { uid: string }
>('settings/load', async ({ uid }, { dispatch, rejectWithValue }) => {
  try {
    const profile = await readUserProfile(uid);
    dispatch(setLanguage(profile?.language ?? DEFAULT_LANGUAGE));
    dispatch(setStartDayLocal(profile?.startDay ?? DEFAULT_START_DAY));
    dispatch(setDefaultPercents(profile?.defaultPercents ?? DEFAULT_PERCENTS));
    dispatch(setCurrency(profile?.currency ?? DEFAULT_CURRENCY));
    dispatch(themeUpdated(profile?.theme ?? DEFAULT_THEME));
    dispatch(updateOnboardingState(profile?.onboardingCompleted ?? false));
    return {
      startDay: profile?.startDay ?? DEFAULT_START_DAY,
      language: profile?.language ?? DEFAULT_LANGUAGE,
      theme: profile?.theme ?? DEFAULT_THEME,
    };
  } catch (error) {
    toast.error('Failed to load settings!');
    return rejectWithValue(error);
  }
});

export const completeOnboardingThunk = createAppAsyncThunk<
  { onboardingData: OnboardingData },
  { uid: string; onboardingData: OnboardingData }
>('settings/completeOnboarding', async ({ uid, onboardingData }, { dispatch, rejectWithValue }) => {
  try {
    await completeOnboarding(uid, onboardingData);
    await dispatch(setPercentsThunk({ uid, percents: onboardingData.percents })).unwrap();
    toast.success('Onboarding completed. Changes saved!');
    return { onboardingData };
  } catch (error) {
    toast.error('Failed to complete onboarding');
    return rejectWithValue(error);
  }
});

export const saveStartDayThunk = createAppAsyncThunk<
  { startDay: number },
  { uid: string; startDay: number }
>('settings/saveStartDay', async ({ uid, startDay }, { rejectWithValue }) => {
  try {
    await upsertUserStartDay(uid, clamp(startDay));
    toast.success('Start day changed successfuly!');
    return { startDay };
  } catch (error) {
    toast.error('Failed to update start day!');
    return rejectWithValue(error);
  }
});

export const saveLanguageThunk = createAppAsyncThunk<
  { language: Language },
  { uid: string; language: Language }
>('settings/saveLanguage', async ({ uid, language }, { dispatch, rejectWithValue }) => {
  try {
    await upsertAppLanguage(uid, language);
    dispatch(setLanguage(language));
    toast.success('Language changed successfuly!');
    return { language };
  } catch (error) {
    toast.error('Failed to update language');
    return rejectWithValue(error);
  }
});

export const setAppThemeThunk = createAppAsyncThunk<
  { theme: Theme },
  { uid: string; theme: Theme }
>('settings/setAppTheme', async ({ uid, theme }, { rejectWithValue }) => {
  try {
    await upsertAppTheme(uid, theme);
    toast.success('Theme changed successfuly!');
    return { theme };
  } catch (error) {
    toast.error('Failed to change theme');
    return rejectWithValue(error);
  }
});

export const updateDefaultPercentsThunk = createAppAsyncThunk<
  { percents: PercentTriple },
  { uid: string; percents: PercentTriple }
>('settings/updateDefaultPercents', async ({ uid, percents }, { rejectWithValue }) => {
  try {
    await upsertDefaultPercents(uid, percents);
    toast.success('Default percents updated successfuly!');
    return { percents };
  } catch (error) {
    toast.error('Failed to update default percents');
    return rejectWithValue(error);
  }
});

export const updateCurrencyThunk = createAppAsyncThunk<
  { currency: Currency },
  { uid: string; currency: Currency }
>('settings/updateCurrency', async ({ uid, currency }, { rejectWithValue }) => {
  try {
    await upsertCurrency(uid, currency);
    toast.success('Currency updated successfuly!');
    return { currency };
  } catch (error) {
    toast.error('Failed to update currency');
    return rejectWithValue(error);
  }
});

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setDefaultPercents(state, action: PayloadAction<PercentTriple>) {
      state.defaultPercents = action.payload;
    },
    setStartDayLocal(state, action: PayloadAction<number>) {
      // Optional immediate local update (optimistic)
      state.startDay = action.payload;
    },
    setLanguage(state, action: PayloadAction<Language>) {
      state.language = action.payload;
      localStorage.setItem('i18nextLng', action.payload); // sync detector cache
    },
    setCurrency(state, action: PayloadAction<Currency>) {
      state.currency = action.payload;
    },
    themeUpdated(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
    },
    updateOnboardingState(state, action: PayloadAction<boolean>) {
      state.onboardingCompleted = action.payload;
    },
  },
  extraReducers: (b) => {
    b.addCase(loadSettings.pending, (s) => {
      s.bootStatus = 'loading';
      s.error = undefined;
    });
    b.addCase(loadSettings.fulfilled, (s, { payload }) => {
      s.bootStatus = 'ready';
      s.startDay = payload.startDay;
    });
    b.addCase(loadSettings.rejected, (s, a) => {
      s.bootStatus = 'error';
      s.error = a.error.message ?? 'Failed to load settings';
    });

    b.addCase(completeOnboardingThunk.pending, (s) => {
      s.error = undefined;
      s.status = 'loading';
    });
    b.addCase(completeOnboardingThunk.fulfilled, (s, { payload }) => {
      s.defaultPercents = payload.onboardingData.percents;
      s.language = payload.onboardingData.language;
      s.startDay = payload.onboardingData.startDay;
      s.onboardingCompleted = true;
      s.status = 'ready';
    });
    b.addCase(completeOnboardingThunk.rejected, (s, a) => {
      s.status = 'error';
      s.error = a.error.message ?? 'Onboarding incomplete!';
    });

    b.addCase(saveStartDayThunk.pending, (s) => {
      s.error = undefined;
      s.status = 'loading';
    });
    b.addCase(saveStartDayThunk.fulfilled, (s, { payload }) => {
      s.startDay = payload.startDay;
      s.status = 'ready';
    });
    b.addCase(saveStartDayThunk.rejected, (s, a) => {
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

    b.addCase(updateDefaultPercentsThunk.pending, (s) => {
      s.error = undefined;
      s.status = 'loading';
    });
    b.addCase(updateDefaultPercentsThunk.fulfilled, (s, { payload }) => {
      s.defaultPercents = payload.percents;
      s.status = 'ready';
    });
    b.addCase(updateDefaultPercentsThunk.rejected, (s, a) => {
      s.status = 'error';
      s.error = a.error.message ?? 'Failed to update default percents';
    });

    b.addCase(updateCurrencyThunk.pending, (s) => {
      s.error = undefined;
      s.status = 'loading';
    });
    b.addCase(updateCurrencyThunk.fulfilled, (s, { payload }) => {
      s.currency = payload.currency;
      s.status = 'ready';
    });
    b.addCase(updateCurrencyThunk.rejected, (s, a) => {
      s.status = 'error';
      s.error = a.error.message ?? 'Failed to update currency';
    });
  },
});

export const {
  setDefaultPercents,
  setStartDayLocal,
  setLanguage,
  setCurrency,
  themeUpdated,
  updateOnboardingState,
} = settingsSlice.actions;
export default settingsSlice.reducer;
