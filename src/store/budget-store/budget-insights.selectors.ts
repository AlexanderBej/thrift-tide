// src/redux/selectors/insights.ts
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { Txn } from '../../api/models/txn';
import { Bucket } from '../../api/types/bucket.types';
import { selectBudgetDoc, selectBudgetMonth, selectBudgetTxns } from './budget.selectors';

// ---- Base selectors you already expose
// export const selectBudgetDoc = (s: RootState) => s.budget.doc;
// export const selectBudgetTxns = (s: RootState) => s.budget.txns;
// export const selectBudgetMonth = (s: RootState) => s.budget.month;

// If you have a settings slice with startDay, wire it here.
// Fallback to 1 if not yet implemented.
export const selectBudgetStartDay = (s: RootState) => (s as any)?.settings?.startDay ?? 1;

// ---- Time helpers (support custom month start)
const MS_PER_DAY = 86_400_000;

function monthBoundsByStart(anchorDate: Date, startDay: number) {
  const y = anchorDate.getFullYear();
  const m = anchorDate.getMonth();
  const startThis = new Date(y, m, startDay);
  const periodStart = anchorDate < startThis ? new Date(y, m - 1, startDay) : startThis;
  const periodEnd = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, startDay); // exclusive
  const totalDays = Math.round((+periodEnd - +periodStart) / MS_PER_DAY);
  return { periodStart, periodEnd, totalDays };
}

function daysElapsed(now: Date, start: Date, end: Date) {
  if (now <= start) return 0;
  const span = Math.floor((+now - +start) / MS_PER_DAY);
  const total = Math.floor((+end - +start) / MS_PER_DAY);
  return Math.min(span, Math.max(0, total));
}

// A representative date inside the selected budget month
function representativeDateFromMonthKey(monthKey: string, startDay: number) {
  const [y, m] = monthKey.split('-').map(Number); // "YYYY-MM"
  return new Date(y, (m ?? 1) - 1, startDay + 1);
}

// ---- Aggregations
type Triple = Record<Bucket, number>;

export const selectAllocatedTriple = createSelector(
  [selectBudgetDoc],
  (doc): Triple => ({
    needs: doc?.allocations.needs ?? 0,
    wants: doc?.allocations.wants ?? 0,
    savings: doc?.allocations.savings ?? 0,
  }),
);

export const selectSpentTriple = createSelector([selectBudgetTxns], (txns): Triple => {
  const acc: Triple = { needs: 0, wants: 0, savings: 0 };
  for (const t of txns) acc[t.type] += Math.max(0, t.amount);
  return acc;
});

export const selectTotals = createSelector(
  [selectAllocatedTriple, selectSpentTriple],
  (alloc, spent) => {
    const remaining: Triple = {
      needs: Math.max(0, alloc.needs - spent.needs),
      wants: Math.max(0, alloc.wants - spent.wants),
      savings: Math.max(0, alloc.savings - spent.savings),
    };
    const totalAllocated = alloc.needs + alloc.wants + alloc.savings;
    const totalSpent = spent.needs + spent.wants + spent.savings;
    const totalRemaining = Math.max(0, totalAllocated - totalSpent);
    return { alloc, spent, remaining, totalAllocated, totalSpent, totalRemaining };
  },
);

// ---- Time context for the selected month (Europe/Madrid by default from browser)
export const selectMonthTiming = createSelector(
  [selectBudgetMonth, selectBudgetStartDay],
  (monthKey, startDay) => {
    const now = new Date();
    const repr = representativeDateFromMonthKey(monthKey, startDay);
    const { periodStart, periodEnd, totalDays } = monthBoundsByStart(repr, startDay);
    const elapsed = daysElapsed(now, periodStart, periodEnd);
    const left = Math.max(0, totalDays - elapsed);
    return { now, periodStart, periodEnd, totalDays, daysElapsed: elapsed, daysLeft: left };
  },
);

// ---- MVP Insights

// 1) Average daily spend (guard small sample sizes)
export const selectAvgDaily = createSelector(
  [selectTotals, selectMonthTiming],
  ({ totalSpent }, t) => (t.daysElapsed >= 3 ? totalSpent / t.daysElapsed : null),
);

// 1b) Average daily per bucket
export const makeSelectAvgDailyBucket = (bucket: Bucket) =>
  createSelector([selectSpentTriple, selectMonthTiming], (spent, t) =>
    t.daysElapsed >= 3 ? spent[bucket] / t.daysElapsed : null,
  );

// 2) Projected month-end spend
export const selectProjectedTotal = createSelector([selectAvgDaily, selectMonthTiming], (avg, t) =>
  avg == null ? null : avg * t.totalDays,
);

// 3) Burn vs Pace
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

// 4) Remaining per day
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

// 5) Distribution (current spend split)
export const selectDistribution = createSelector([selectSpentTriple], (spent) => spent);

// Alerts (simple rule for MVP)
export const selectInsightsAlerts = createSelector([selectBurnVsPace], ({ burn, pace }) => {
  const alerts: string[] = [];
  if (pace == null) return alerts;
  const THRESH = 0.1; // 10 percentage points
  (['needs', 'wants', 'savings', 'total'] as const).forEach((k) => {
    const b = burn[k];
    if (b != null && b > pace + THRESH) alerts.push(`Overspending in ${k}`);
  });
  return alerts;
});

// Dashboard one-shot payload
export const selectDashboardInsights = createSelector(
  [selectTotals, selectAvgDaily, selectProjectedTotal, selectBurnVsPace, selectRemainingPerDay],
  (tot, avgDaily, projectedTotal, burnVsPace, remainingPerDay) => ({
    totals: tot,
    avgDaily,
    projectedTotal,
    burnVsPace,
    remainingPerDay,
    distribution: {
      needs: tot.spent.needs,
      wants: tot.spent.wants,
      savings: tot.spent.savings,
    },
  }),
);
