import { createSelector } from '@reduxjs/toolkit';
import { selectBudgetDoc, selectBudgetMonth } from './budget.selectors.base';
import { periodBounds, representativeDateFromMonthKey } from '../../utils/period.util';
import { selectBudgetStartDay } from '../settings-store/settings.selectors';

/** [Core] The concrete time window of the selected period (start inclusive, end exclusive),
 * plus calendar stats (daysElapsed, daysLeft, totalDays). */
/** Uses frozen month doc timing if available; otherwise falls back to current settings. */
export const selectMonthTiming = createSelector(
  [selectBudgetMonth, selectBudgetStartDay, selectBudgetDoc],
  (monthKey, userStartDay, doc) => {
    if (doc?.periodStart && doc?.periodEnd && doc?.startDay) {
      const periodStart = new Date(doc.periodStart);
      const periodEnd = new Date(doc.periodEnd);
      const totalDays = Math.max(0, Math.round((+periodEnd - +periodStart) / 86_400_000));
      const now = new Date();
      const elapsed = Math.min(
        totalDays,
        Math.max(0, Math.floor((+now - +periodStart) / 86_400_000)),
      );
      return {
        now,
        periodStart,
        periodEnd,
        totalDays,
        daysElapsed: elapsed,
        daysLeft: totalDays - elapsed,
      };
    }

    // fallback if month doc doesn’t have frozen fields (old months)
    const now = new Date();
    const repr = representativeDateFromMonthKey(monthKey, userStartDay);
    const { start, end, totalDays } = periodBounds(repr, userStartDay);
    const elapsed = Math.min(totalDays, Math.max(0, Math.floor((+now - +start) / 86_400_000)));
    return {
      now,
      periodStart: start,
      periodEnd: end,
      totalDays,
      daysElapsed: elapsed,
      daysLeft: totalDays - elapsed,
    };
  },
);
