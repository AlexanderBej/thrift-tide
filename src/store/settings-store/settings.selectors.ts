import { RootState } from '../store';

export const selectBudgetStartDay = (s: RootState) => s.settings.startDay;
