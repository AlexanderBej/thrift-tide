import { createSelector } from '@reduxjs/toolkit';

import { Bucket } from '../../api/types/bucket.types';
import { Txn } from '../../api/models/txn';
import { selectBudgetDoc, selectBudgetTxns, selectTxnUi } from './budget.selectors.base';
import { selectMonthTiming } from './budget-period.selectors';

/** All transactions that fall inside the current [periodStart, periodEnd). */
export const selectTxnsInPeriod = createSelector([selectBudgetTxns, selectMonthTiming], (txns, t) =>
  txns.filter((x) => {
    // const d = x.date as unknown as Date; // services should normalize to Date
    const d = new Date(x.date); // services should normalize to Date
    return d >= t.periodStart && d < t.periodEnd;
  }),
);

/** Sums spent per high-level bucket within the selected period. */
export const selectSpentByBucket = createSelector([selectTxnsInPeriod], (txns) => {
  let needs = 0,
    wants = 0,
    savings = 0;
  for (const t of txns) {
    if (t.type === 'needs') needs += t.amount;
    else if (t.type === 'wants') wants += t.amount;
    else if (t.type === 'savings') savings += t.amount;
  }
  return { needs, wants, savings };
});

/** Optional: map of "type:category" -> total, within the period. Useful for side widgets. */
export const selectSpentByCategory = createSelector([selectTxnsInPeriod], (txns) => {
  const map: Record<string, number> = {};
  for (const t of txns) {
    const key = `${t.type}:${t.category || 'Uncategorized'}`;
    map[key] = (map[key] || 0) + t.amount;
  }
  return map;
});

export interface CategoryCard {
  key: Bucket;
  title: string;
  allocated: number;
  spent: number;
  remaining: number;
  progress: number; // 0..1
}

/** The 3 Category cards (Needs/Wants/Savings) with allocated/spent/remaining/progress for the period. */
export const selectCards = createSelector([selectBudgetDoc, selectSpentByBucket], (doc, spent) => {
  if (!doc) return [] as CategoryCard[];
  return (['needs', 'wants', 'savings'] as const).map((k) => {
    const allocated = doc.allocations[k] ?? 0;
    const used = spent[k];
    const remaining = Math.max(0, allocated - used);
    const progress = allocated > 0 ? Math.min(1, used / allocated) : 0;
    return {
      key: k,
      title: k[0].toUpperCase() + k.slice(1),
      allocated,
      spent: used,
      remaining,
      progress,
    };
  });
});

/** Detailed view for a single bucket: items list, totals, and per-category breakdown. */
export const makeSelectCategoryView = (bucket: Bucket) =>
  createSelector([selectBudgetDoc, selectTxnsInPeriod], (doc, txns) => {
    if (!doc) return null;

    const allocated = doc.allocations[bucket] ?? 0;
    const filtered = txns.filter((t) => t.type === bucket);
    const spent = filtered.reduce((sum, t) => sum + t.amount, 0);
    const remaining = Math.max(0, allocated - spent);
    const progress = allocated > 0 ? Math.min(1, spent / allocated) : 0;

    const byCategoryMap = new Map<string, number>();
    for (const t of filtered) {
      const key = t.category || 'Uncategorized';
      byCategoryMap.set(key, (byCategoryMap.get(key) ?? 0) + t.amount);
    }
    const byCategory = Array.from(byCategoryMap, ([category, total]) => ({ category, total })).sort(
      (a, b) => b.total - a.total,
    );

    return { allocated, spent, remaining, progress, items: filtered, byCategory };
  });

/** Filter/search/sort the in-period transactions according to UI state. */
export const selectFilteredTxns = createSelector([selectTxnsInPeriod, selectTxnUi], (txns, ui) => {
  const q = ui.search.trim().toLowerCase();

  const filtered = txns
    .filter((t) => (ui.type === 'all' ? true : t.type === ui.type))
    .filter((t) =>
      q.length === 0
        ? true
        : (t.note ?? '').toLowerCase().includes(q) || (t.category ?? '').toLowerCase().includes(q),
    );

  const dir = ui.sortDir === 'asc' ? 1 : -1;
  const sorted = [...filtered].sort((a, b) => {
    if (ui.sortKey === 'date') return dir * (+a.date - +b.date); // Date numeric compare
    return dir * (a.amount - b.amount);
  });

  return sorted;
});

/** Group filtered list by calendar day string (YYYY-MM-DD), newest group first. */
export const selectTxnsGroupedByDate = createSelector([selectFilteredTxns], (txns) => {
  // const toYYYYMMDD = (d: Date) => d.toISOString().slice(0, 10);
  const buckets = new Map<string, Txn[]>();

  for (const t of txns) {
    const day = t.date;
    if (!buckets.has(day)) buckets.set(day, []);
    buckets.get(day)!.push(t);
  }

  return Array.from(buckets.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, items]) => ({ date, items }));
});

/** Sum of currently filtered transactions (e.g., for list header). */
export const selectFilteredTotal = createSelector([selectFilteredTxns], (txns) =>
  txns.reduce((sum, t) => sum + t.amount, 0),
);

/** Header recap: per-bucket totals within the selected period. */
export const selectMonthTotalsByBucket = createSelector([selectTxnsInPeriod], (txns) => {
  let needs = 0,
    wants = 0,
    savings = 0;
  for (const t of txns) {
    if (t.type === 'needs') needs += t.amount;
    else if (t.type === 'wants') wants += t.amount;
    else if (t.type === 'savings') savings += t.amount;
  }
  return { needs, wants, savings };
});

/** Period-allocated amounts per bucket (pulled from MonthDoc). */
export const selectAllocatedTriple = createSelector([selectBudgetDoc], (doc) => ({
  needs: doc?.allocations.needs ?? 0,
  wants: doc?.allocations.wants ?? 0,
  savings: doc?.allocations.savings ?? 0,
}));

/** Period-spent amounts per bucket (derived from in-period txns). */
export const selectSpentTriple = createSelector([selectTxnsInPeriod], (txns) => {
  const acc = { needs: 0, wants: 0, savings: 0 };
  for (const t of txns) {
    acc[t.type] += Math.max(0, t.amount);
  }
  return acc;
});

/** Aggregated totals for the period: per-bucket & grand totals, remaining, etc. */
export const selectTotals = createSelector(
  [selectAllocatedTriple, selectSpentTriple],
  (alloc, spent) => {
    const remaining = {
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

export const selectTopCategoriesOverall = createSelector([selectTxnsInPeriod], (txns) => {
  const totals: Record<string, number> = {};

  for (const t of txns) {
    const cat = t.category || 'Uncategorized';
    totals[cat] = (totals[cat] ?? 0) + t.amount;
  }

  // Turn into a sorted array
  const sorted = Object.entries(totals)
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);

  return sorted.slice(0, 3); // top 3
});
