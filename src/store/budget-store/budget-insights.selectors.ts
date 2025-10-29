import { createSelector } from '@reduxjs/toolkit';
import { Bucket } from '../../api/types/bucket.types';
import { selectAllocatedTriple, selectTotals, selectTxnsInPeriod } from './budget.selectors';
import { selectMonthTiming } from './budget-period.selectors';
import { addDays, eachDayOfInterval, format } from 'date-fns';
import { getCssVar } from '../../utils/style-variable.util';

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

export const makeSelectBucketPanel = (bucket: Bucket) =>
  createSelector(
    [selectTotals, selectMonthTiming, makeSelectAvgDailyBucket(bucket)],
    (tot, t, avgDailyBucket) => {
      const alloc = tot.alloc[bucket];
      const spent = tot.spent[bucket];
      const remaining = Math.max(0, alloc - spent);
      const remainingPerDay = t.daysLeft > 0 ? remaining / t.daysLeft : null;
      const daysToZero =
        avgDailyBucket && avgDailyBucket > 0 ? Math.ceil(remaining / avgDailyBucket) : null;

      // Estimated run-out date (clamped to end of period)
      const runOutDate =
        daysToZero != null
          ? new Date(Math.min(+t.periodEnd, +t.now + daysToZero * 86_400_000))
          : null;

      return { alloc, spent, remaining, remainingPerDay, daysToZero, runOutDate };
    },
  );

type Mode = 'cumulative' | 'daily';
type Options = {
  mode?: Mode;
  includeTotal?: boolean;
  includePace?: boolean;
};

const ZERO: Record<Bucket, number> = { needs: 0, wants: 0, savings: 0 };

export const makeSelectBucketTrendsNivo = (opts: Options = {}) =>
  createSelector(
    [selectTxnsInPeriod, selectMonthTiming, selectAllocatedTriple],
    (txns, t, alloc) => {
      const mode: Mode = opts.mode ?? 'cumulative';

      // Build day list for the **budget period**, note: end is exclusive -> subtract 1 day
      const lastInclusive = addDays(t.periodEnd, -1);
      const days = eachDayOfInterval({ start: t.periodStart, end: lastInclusive });

      // Sum amounts per day per bucket (within the period you already filtered)
      const byDay: Record<string, Record<Bucket, number>> = {};
      for (const x of txns) {
        // x.date likely "YYYY-MM-DD" – normalize to the same format as our keys
        const key = format(new Date(x.date), 'yyyy-MM-dd');
        (byDay[key] ??= { ...ZERO })[x.type] += Math.max(0, x.amount);
      }

      // Build series
      let acc = { ...ZERO };
      const seriesNeeds: { x: string; y: number }[] = [];
      const seriesWants: { x: string; y: number }[] = [];
      const seriesSavings: { x: string; y: number }[] = [];
      const seriesTotal: { x: string; y: number }[] = [];
      const seriesPaceTotal: { x: string; y: number }[] = [];

      const totalAlloc = alloc.needs + alloc.wants + alloc.savings;

      days.forEach((d, i) => {
        const key = format(d, 'yyyy-MM-dd');
        const label = format(d, 'd');
        const today = byDay[key] ?? ZERO;

        // accumulate if cumulative; else just today's amounts
        acc =
          mode === 'cumulative'
            ? {
                needs: acc.needs + today.needs,
                wants: acc.wants + today.wants,
                savings: acc.savings + today.savings,
              }
            : { ...today };

        const tot = acc.needs + acc.wants + acc.savings;

        seriesNeeds.push({ x: label, y: acc.needs });
        seriesWants.push({ x: label, y: acc.wants });
        seriesSavings.push({ x: label, y: acc.savings });
        seriesTotal.push({ x: label, y: tot });

        // Expected pace (linear) for TOTAL allocation across the period
        if (opts.includePace && t.totalDays > 0) {
          const progress = (i + 1) / t.totalDays; // day index is 0-based
          seriesPaceTotal.push({ x: label, y: totalAlloc * progress });
        }
      });

      const out = [
        { id: 'Needs', color: getCssVar('--needs'), data: seriesNeeds },
        { id: 'Wants', color: getCssVar('--wants'), data: seriesWants },
        { id: 'Savings', color: getCssVar('--savings'), data: seriesSavings },
      ];
      if (opts.includeTotal)
        out.push({ id: 'Total', color: getCssVar('--text-primary'), data: seriesTotal });
      if (opts.includePace)
        out.push({
          id: 'Pace (Total)',
          color: getCssVar('--text-secondary'),
          data: seriesPaceTotal,
        });

      return out;
    },
  );
