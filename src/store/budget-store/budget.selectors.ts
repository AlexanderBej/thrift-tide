import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { Bucket } from '../../api/types/bucket.types';

export const selectBudgetStatus = (state: RootState) => state.budget.status;
export const selectBudgetMonth = (state: RootState) => state.budget.month;
export const selectBudgetDoc = (state: RootState) => state.budget.doc;
export const selectBudgetTxns = (state: RootState) => state.budget.txns;

export interface CategoryCard {
  key: Bucket;
  title: string;
  allocated: number;
  spent: number;
  remaining: number;
  progress: number; // 0..1
}

// export type BucketParam = "need" | "want" | "saving"; // txn types
// type AllocationKey = "needs" | "wants" | "savings"; // month doc keys
// const toAllocKey = (t: BucketParam): AllocationKey =>
//   t === "need" ? "needs" : t === "want" ? "wants" : "savings";

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
