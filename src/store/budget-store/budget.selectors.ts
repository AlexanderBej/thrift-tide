import { createSelector } from '@reduxjs/toolkit';
import { format } from 'date-fns';

import { Category } from '@api/types';
import { Txn } from '@api/models';
import { selectBudgetDoc, selectBudgetTxns, selectTxnUi } from './budget.selectors.base';
import { selectMonthTiming } from './budget-period.selectors';
import { toYMDUTC } from '@shared/utils';

const isYmd = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);
const txnDayKey = (date: Txn['date']) => (isYmd(date) ? date : toYMDUTC(date));

/** All transactions that fall inside the current [periodStart, periodEnd). */
export const selectTxnsInPeriod = createSelector([selectBudgetTxns, selectMonthTiming], (txns, t) =>
  {
    const startKey = format(t.periodStart, 'yyyy-MM-dd');
    const endKey = format(t.periodEnd, 'yyyy-MM-dd'); // end is exclusive

    return txns.filter((x) => {
      const day = txnDayKey(x.date);
      return day >= startKey && day < endKey;
    });
  },
);

/** Sums spent per high-level category within the selected period. */
const selectSpentByCategory = createSelector([selectTxnsInPeriod], (txns) => {
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

export interface ExpenseGroupCard {
  key: Category;
  title: string;
  allocated: number;
  spent: number;
  remaining: number;
  progress: number; // 0..1
}

/** The 3 ExpenseGroup cards (Needs/Wants/Savings) with allocated/spent/remaining/progress for the period. */
export const selectCards = createSelector(
  [selectBudgetDoc, selectSpentByCategory],
  (doc, spent) => {
    if (!doc) return [] as ExpenseGroupCard[];
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
  },
);

/** Detailed view for a single categories: items list, totals, and per-exp group breakdown. */
export const makeSelectExpenseGroupView = (cat: Category) =>
  createSelector([selectBudgetDoc, selectTxnsInPeriod], (doc, txns) => {
    if (!doc) return null;

    const allocated = doc.allocations[cat] ?? 0;
    const filtered = txns.filter((t) => t.type === cat);
    const spent = filtered.reduce((sum, t) => sum + t.amount, 0);
    const remaining = Math.max(0, allocated - spent);
    const progress = allocated > 0 ? Math.min(1, spent / allocated) : 0;

    const byExpGroupMap = new Map<string, number>();
    for (const t of filtered) {
      const key = t.expenseGroup || 'Uncategorized';
      byExpGroupMap.set(key, (byExpGroupMap.get(key) ?? 0) + t.amount);
    }
    const byExpGroup = Array.from(byExpGroupMap, ([expGroup, total]) => ({ expGroup, total })).sort(
      (a, b) => b.total - a.total,
    );

    return { allocated, spent, remaining, progress, items: filtered, byExpGroup };
  });

/** Filter/search/sort the in-period transactions according to UI state. */
const selectFilteredTxns = createSelector([selectTxnsInPeriod, selectTxnUi], (txns, ui) => {
  const q = ui.search.trim().toLowerCase();

  const filtered = txns
    .filter((t) => (ui.type === 'all' ? true : t.type === ui.type))
    .filter((t) =>
      q.length === 0
        ? true
        : (t.note ?? '').toLowerCase().includes(q) ||
          (t.expenseGroup ?? '').toLowerCase().includes(q),
    );

  const dir = ui.sortDir === 'asc' ? 1 : -1;
  const sorted = [...filtered].sort((a, b) => {
    if (ui.sortKey === 'date') return dir * txnDayKey(a.date).localeCompare(txnDayKey(b.date));
    return dir * (a.amount - b.amount);
  });

  return sorted;
});

/** Group filtered list by calendar day string (YYYY-MM-DD), newest group first. */
export const selectTxnsGroupedByDate = createSelector([selectFilteredTxns], (txns) => {
  // const toYYYYMMDD = (d: Date) => d.toISOString().slice(0, 10);
  const categories = new Map<string, Txn[]>();

  for (const t of txns) {
    const day = txnDayKey(t.date);
    if (!categories.has(day)) categories.set(day, []);
    categories.get(day)!.push(t);
  }

  return Array.from(categories.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, items]) => ({ date, items }));
});

/** Sum of currently filtered transactions (e.g., for list header). */
export const selectFilteredTotal = createSelector([selectFilteredTxns], (txns) =>
  txns.reduce((sum, t) => sum + t.amount, 0),
);

/** Period-allocated amounts per category (pulled from MonthDoc). */
const selectAllocatedTriple = createSelector([selectBudgetDoc], (doc) => ({
  needs: doc?.allocations.needs ?? 0,
  wants: doc?.allocations.wants ?? 0,
  savings: doc?.allocations.savings ?? 0,
}));

/** Period-spent amounts per category (derived from in-period txns). */
const selectSpentTriple = createSelector([selectTxnsInPeriod], (txns) => {
  const acc = { needs: 0, wants: 0, savings: 0 };
  for (const t of txns) {
    acc[t.type] += Math.max(0, t.amount);
  }
  return acc;
});

/** Aggregated totals for the period: per-category & grand totals, remaining, etc. */
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

export const selectTopExpenseGroupsOverall = createSelector([selectTxnsInPeriod], (txns) => {
  const map = new Map<string, { total: number; byCategory: Record<Category, number> }>();

  for (const t of txns) {
    const expGroup = t.expenseGroup || 'Uncategorized';
    const spend = Math.max(0, t.amount);

    if (!map.has(expGroup)) {
      map.set(expGroup, {
        total: 0,
        byCategory: { needs: 0, wants: 0, savings: 0 },
      });
    }

    const entry = map.get(expGroup)!;
    entry.total += spend;
    entry.byCategory[t.type] += spend;
  }

  const pickCategory = (byCategory: Record<Category, number>): Category => {
    const entries = Object.entries(byCategory) as Array<[Category, number]>;
    // choose the category with the largest total for this expGroup
    return entries.reduce((best, cur) => (cur[1] > best[1] ? cur : best))[0];
  };

  return Array.from(map.entries())
    .map(([expGroup, { total, byCategory }]) => ({
      expGroup,
      total,
      category: pickCategory(byCategory),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
});
