import { createSelector } from '@reduxjs/toolkit';
import { Bucket } from '../../api/types/bucket.types';
import { selectTotals } from './budget.selectors';
import { selectMonthTiming } from './budget-period.selectors';

/** Average daily spend so far in the period (null for first 2 days to avoid noise). */
export const selectAvgDaily = createSelector(
  [selectTotals, selectMonthTiming],
  ({ totalSpent }, t) => (t.daysElapsed >= 3 ? totalSpent / t.daysElapsed : null),
);

/** Average daily spend for a specific bucket (null for first 2 days). */
export const makeSelectAvgDailyBucket = (bucket: Bucket) =>
  createSelector([selectTotals, selectMonthTiming], ({ spent }, t) =>
    t.daysElapsed >= 3 ? spent[bucket] / t.daysElapsed : null,
  );

/** Simple projection to period end based on current daily average (null early in period). */
export const selectProjectedTotal = createSelector([selectAvgDaily, selectMonthTiming], (avg, t) =>
  avg == null ? null : avg * t.totalDays,
);

/** Burn (spent/allocated) vs Pace (daysElapsed/totalDays). */
export const selectBurnVsPace = createSelector([selectTotals, selectMonthTiming], (tot, t) => {
  const ratio = (spent: number, alloc: number) => (alloc > 0 ? spent / alloc : null);
  const burn = {
    needs: ratio(tot.spent.needs, tot.alloc.needs),
    wants: ratio(tot.spent.wants, tot.alloc.wants),
    savings: ratio(tot.spent.savings, tot.alloc.savings),
    total: ratio(tot.totalSpent, tot.totalAllocated),
  };
  const pace = t.totalDays > 0 ? t.daysElapsed / t.totalDays : null;
  return { burn, pace };
});

/** “How much can I spend per day and still hit budget?” (null if last day passed). */
export const selectRemainingPerDay = createSelector([selectTotals, selectMonthTiming], (tot, t) => {
  if (t.daysLeft <= 0) return null;
  const f = (n: number) => n / t.daysLeft;
  return {
    needs: f(tot.remaining.needs),
    wants: f(tot.remaining.wants),
    savings: f(tot.remaining.savings),
    total: f(tot.totalRemaining),
  };
});

/** Snapshot used to hydrate a dashboard view at once. */
export const selectDashboardInsights = createSelector(
  [selectTotals, selectAvgDaily, selectProjectedTotal, selectBurnVsPace, selectRemainingPerDay],
  (tot, avgDaily, projectedTotal, burnVsPace, remainingPerDay) => ({
    totals: tot,
    avgDaily,
    projectedTotal,
    burnVsPace,
    remainingPerDay,
    distribution: { needs: tot.spent.needs, wants: tot.spent.wants, savings: tot.spent.savings },
  }),
);
