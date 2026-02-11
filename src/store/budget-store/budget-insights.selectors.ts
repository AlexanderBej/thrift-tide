import { createSelector } from '@reduxjs/toolkit';
import { Category } from '@api/types';
import { selectTotals } from './budget.selectors';
import { selectMonthTiming } from './budget-period.selectors';

/** Average daily spend so far in the period (null for first 2 days to avoid noise). */
const selectAvgDaily = createSelector([selectTotals, selectMonthTiming], ({ totalSpent }, t) =>
  t.daysElapsed >= 3 ? totalSpent / t.daysElapsed : null,
);

/** Average daily spend for a specific category (null for first 2 days). */
const makeSelectAvgDailyCategory = (cat: Category) =>
  createSelector([selectTotals, selectMonthTiming], ({ spent }, t) =>
    t.daysElapsed >= 3 ? spent[cat] / t.daysElapsed : null,
  );

/** Simple projection to period end based on current daily average (null early in period). */
const selectProjectedTotal = createSelector([selectAvgDaily, selectMonthTiming], (avg, t) =>
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
const selectRemainingPerDay = createSelector([selectTotals, selectMonthTiming], (tot, t) => {
  if (t.daysLeft <= 0) {
    return null;
  }
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

export const makeSelectCategoryPanel = (cat: Category) =>
  createSelector(
    [selectTotals, selectMonthTiming, makeSelectAvgDailyCategory(cat)],
    (tot, t, avgDailyCat) => {
      const alloc = tot.alloc[cat];
      const spent = tot.spent[cat];
      const remaining = Math.max(0, alloc - spent);
      const remainingPerDay = t.daysLeft > 0 ? remaining / t.daysLeft : null;
      const daysToZero =
        remaining > 0 && avgDailyCat && avgDailyCat > 0 ? Math.ceil(remaining / avgDailyCat) : null;

      // Estimated run-out date (clamped to end of period)
      const runOutDate =
        daysToZero != null
          ? new Date(Math.min(+t.periodEnd, +t.now + daysToZero * 86_400_000))
          : null;

      return { alloc, spent, remaining, remainingPerDay, daysToZero, runOutDate };
    },
  );
