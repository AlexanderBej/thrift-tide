import { isAnyOf, Middleware } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

import i18n from '../../i18n/i18n';
import {
  completeOnboardingThunk,
  saveStartDayThunk,
  saveLanguageThunk,
  setAppThemeThunk,
  updateDefaultPercentsThunk,
  updateCurrencyThunk,
  loadSettings,
} from '../settings-store/settings.slice';

export const settingsToastMiddleware: Middleware = () => (next) => (action) => {
  // success
  if (
    isAnyOf(
      completeOnboardingThunk.fulfilled,
      saveStartDayThunk.fulfilled,
      saveLanguageThunk.fulfilled,
      setAppThemeThunk.fulfilled,
      updateDefaultPercentsThunk.fulfilled,
      updateCurrencyThunk.fulfilled,
    )(action)
  ) {
    const map: Record<string, string> = {
      [completeOnboardingThunk.fulfilled.type]: i18n.t(
        'settings:toast.completeOnboarding.success',
      ),
      [saveStartDayThunk.fulfilled.type]: i18n.t('settings:toast.startDay.success'),
      [saveLanguageThunk.fulfilled.type]: i18n.t('settings:toast.language.success'),
      [setAppThemeThunk.fulfilled.type]: i18n.t('settings:toast.theme.success'),
      [updateDefaultPercentsThunk.fulfilled.type]: i18n.t('settings:toast.percents.success'),
      [updateCurrencyThunk.fulfilled.type]: i18n.t('settings:toast.currency.success'),
    };
    const msg = map[action.type];
    if (msg) toast.success(msg);
  }

  // errors
  if (
    isAnyOf(
      loadSettings.rejected,
      completeOnboardingThunk.rejected,
      saveStartDayThunk.rejected,
      saveLanguageThunk.rejected,
      setAppThemeThunk.rejected,
      updateDefaultPercentsThunk.rejected,
      updateCurrencyThunk.rejected,
    )(action)
  ) {
    const map: Record<string, string> = {
      [loadSettings.rejected.type]: i18n.t('settings:toast.load.error'),
      [completeOnboardingThunk.rejected.type]: i18n.t(
        'settings:toast.completeOnboarding.error',
      ),
      [saveStartDayThunk.rejected.type]: i18n.t('settings:toast.startDay.error'),
      [saveLanguageThunk.rejected.type]: i18n.t('settings:toast.language.error'),
      [setAppThemeThunk.rejected.type]: i18n.t('settings:toast.theme.error'),
      [updateDefaultPercentsThunk.rejected.type]: i18n.t('settings:toast.percents.error'),
      [updateCurrencyThunk.rejected.type]: i18n.t('settings:toast.currency.error'),
    };
    const msg = map[action.type];
    if (msg) toast.error(msg);
  }

  return next(action);
};
