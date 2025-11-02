import { RootState } from '../store';

export const selectSettingsBudgetStartDay = (s: RootState) => s.settings.startDay;
export const selectSettingsAppLanguage = (s: RootState) => s.settings.language;
export const selectSettingsAppTheme = (s: RootState) => s.settings.theme;
