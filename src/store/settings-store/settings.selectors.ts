import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';

export const selectSettingsStatus = (s: RootState) => s.settings.status;
export const selectSettingsBootStatus = (s: RootState) => s.settings.bootStatus;
export const selectSettingsBudgetStartDay = (s: RootState) => s.settings.startDay;
export const selectSettingsAppLanguage = (s: RootState) => s.settings.language;
export const selectSettingsAppTheme = (s: RootState) => s.settings.theme;
export const selectSettingOnboardingState = (s: RootState) => s.settings.onboardingCompleted;
export const selectSettingsDefaultPercents = (s: RootState) => s.settings.defaultPercents;
export const selectSettingsCurrency = (s: RootState) => s.settings.currency;
export const selectSettingsAll = (s: RootState) => s.settings;

export const selectOnboardingSettings = createSelector(
  [
    selectSettingsBudgetStartDay,
    selectSettingsAppLanguage,
    selectSettingsDefaultPercents,
    selectSettingsCurrency,
  ],
  (startDay, language, percents, currency) => {
    return { startDay, language, percents, currency };
  },
);
