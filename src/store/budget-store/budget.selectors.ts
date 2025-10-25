import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';

export const selectBudgetStatus = (state: RootState) => state.budget.status;
export const selectBudgetMonth = (state: RootState) => state.budget.month;
export const selectBudgetDoc = (state: RootState) => state.budget.doc;
export const selectBudgetTxns = (state: RootState) => state.budget.txns;

export interface CategoryCard {
  key: 'needs' | 'wants' | 'savings';
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
    if (t.type === 'need') needs += t.amount;
    if (t.type === 'want') wants += t.amount;
    if (t.type === 'saving') savings += t.amount;
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
