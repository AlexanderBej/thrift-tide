import { RootState } from '../store';

export const selectSettingsBudgetStartDay = (s: RootState) => s.settings.startDay;
