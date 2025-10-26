import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { Bucket } from '../../api/types/bucket.types';
import { Txn } from '../../api/models/txn';

export const selectBudgetStatus = (state: RootState) => state.budget.status;
export const selectBudgetMonth = (state: RootState) => state.budget.month;
export const selectBudgetDoc = (state: RootState) => state.budget.doc;
export const selectBudgetTotal = (state: RootState) => state.budget.doc?.income;
export const selectBudgetTxns = (state: RootState) => state.budget.txns;
export const selectTxnUi = (state: RootState) => state.budget.ui;

export interface CategoryCard {
  key: Bucket;
  title: string;
  allocated: number;
  spent: number;
  remaining: number;
  progress: number; // 0..1
}

export const selectSpentByBucket = createSelector([selectBudgetTxns], (txns) => {
  let needs = 0,
    wants = 0,
    savings = 0;
  for (const t of txns) {
    if (t.type === 'needs') needs += t.amount;
    if (t.type === 'wants') wants += t.amount;
    if (t.type === 'savings') savings += t.amount;
  }
  return { needs, wants, savings };
});

// Optional: breakdown by category for a side widget
export const selectSpentByCategory = createSelector([selectBudgetTxns], (txns) => {
  const map: Record<string, number> = {};
  for (const t of txns) {
    const key = `${t.type}:${t.category || 'Uncategorized'}`;
    map[key] = (map[key] || 0) + t.amount;
  }
  return map;
});

export const selectCards = createSelector([selectBudgetDoc, selectSpentByBucket], (doc, spent) => {
  if (!doc) return null;
  const entries = ['needs', 'wants', 'savings'] as const;

  return entries.map((k) => {
    const allocated = doc.allocations[k];
    const used = spent[k];
    const remaining = Math.max(0, allocated - used);
    const progress = allocated > 0 ? Math.min(1, used / allocated) : 0;

    return {
      key: k,
      title: k[0].toUpperCase() + k.slice(1),
      allocated,
      spent: used,
      remaining,
      progress, // 0..1
    };
  });
});

export const makeSelectCategoryView = (bucket: Bucket) =>
  createSelector([selectBudgetDoc, selectBudgetTxns], (doc, txns) => {
    if (!doc) return null;

    // const allocKey = toAllocKey(bucket);
    const allocated = doc.allocations[bucket] ?? 0;

    const filtered = txns.filter((t: { type: Bucket }) => t.type === bucket);
    const spent = filtered.reduce((sum: number, t: { amount: number }) => sum + t.amount, 0);
    const remaining = Math.max(0, allocated - spent);
    const progress = allocated > 0 ? Math.min(1, spent / allocated) : 0;

    // per-category breakdown inside this bucket
    const byCategoryMap = new Map<string, number>();
    for (const t of filtered) {
      const key = t.category || 'Uncategorized';
      byCategoryMap.set(key, (byCategoryMap.get(key) ?? 0) + t.amount);
    }
    const byCategory = Array.from(byCategoryMap, ([category, total]) => ({
      category,
      total,
    })).sort((a, b) => b.total - a.total);

    return {
      allocated,
      spent,
      remaining,
      progress,
      items: filtered,
      byCategory,
    };
  });

const inMonth = (isoDate: string, monthKey: string) => isoDate.startsWith(monthKey); // 'YYYY-MM'
const matchesType = (t: Txn, f: 'all' | 'needs' | 'wants' | 'savings') =>
  f === 'all' || t.type === f;

// 3.1 Filtered txns for the current view
export const selectFilteredTxns = createSelector(
  [selectBudgetTxns, selectBudgetMonth, selectTxnUi],
  (txns, month, ui) => {
    const q = ui.search.trim().toLowerCase();

    const filtered = txns
      .filter((t) => inMonth(t.date, month))
      .filter((t) => matchesType(t, ui.type))
      .filter((t) =>
        q.length === 0
          ? true
          : (t.note ?? '').toLowerCase().includes(q) ||
            (t.category ?? '').toLowerCase().includes(q),
      );

    const sorted = [...filtered].sort((a, b) => {
      const dir = ui.sortDir === 'asc' ? 1 : -1;
      if (ui.sortKey === 'date') return dir * a.date.localeCompare(b.date);
      return dir * (a.amount - b.amount);
    });

    return sorted;
  },
);

// 3.2 Group by day for list sections
export const selectTxnsGroupedByDate = createSelector([selectFilteredTxns], (txns) => {
  const buckets = new Map<string, Txn[]>();
  for (const t of txns) {
    const day = t.date; // 'YYYY-MM-DD'
    if (!buckets.has(day)) buckets.set(day, []);
    buckets.get(day)!.push(t);
  }

  return Array.from(buckets.entries())
    .sort((a, b) => b[0].localeCompare(a[0])) // newest group first
    .map(([date, items]) => ({ date, items }));
});

// 3.3 Total for current filtered view
export const selectFilteredTotal = createSelector([selectFilteredTxns], (txns) =>
  txns.reduce((sum, t) => sum + t.amount, 0),
);

// 3.4 Per-bucket totals for the selected month (for header recaps)
export const selectMonthTotalsByBucket = createSelector(
  [selectBudgetTxns, selectBudgetMonth],
  (txns, month) => {
    let needs = 0,
      wants = 0,
      savings = 0;
    for (const t of txns) {
      if (!inMonth(t.date, month)) continue;
      if (t.type === 'needs') needs += t.amount;
      else if (t.type === 'wants') wants += t.amount;
      else if (t.type === 'savings') savings += t.amount;
    }
    return { needs, wants, savings };
  },
);
