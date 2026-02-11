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
export const selectTxnsInPeriod = createSelector(
  [selectBudgetTxns, selectMonthTiming],
  (txns, t) => {
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
    if (t.category === 'needs') needs += t.amount;
    else if (t.category === 'wants') wants += t.amount;
    else if (t.category === 'savings') savings += t.amount;
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
    const filtered = txns.filter((t) => t.category === cat);
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

  return txns
    .filter((t) => (ui.type === 'all' ? true : t.category === ui.type))
    .filter((t) =>
      q.length === 0
        ? true
        : (t.note ?? '').toLowerCase().includes(q) ||
          (t.expenseGroup ?? '').toLowerCase().includes(q),
    );
});

const selectSortedTxns = createSelector([selectFilteredTxns, selectTxnUi], (filtered, ui) => {
  const dir = ui.sortDir === 'asc' ? 1 : -1;
  return [...filtered].sort((a, b) => {
    if (ui.sortKey === 'date') return dir * txnDayKey(a.date).localeCompare(txnDayKey(b.date));
    if (ui.sortKey === 'amount') return dir * (a.amount - b.amount);
    return dir * (a.amount - b.amount);
  });
});

export interface TxnListGroup {
  key: string;
  label: string;
  items: Txn[];
  total: number;
  kind: 'date' | 'expenseGroup';
}

/** Group filtered txns by date (default) or bucket (special mode). */
export const selectTxnListGroups = createSelector([selectSortedTxns, selectTxnUi], (txns, ui) => {
  if (ui.sortKey === 'expenseGroup') {
    const groups = new Map<string, Txn[]>();

    for (const t of txns) {
      const expenseGroup = (t.expenseGroup ?? '').trim();
      const groupKey = expenseGroup.length > 0 ? expenseGroup : '__uncategorized__';
      if (!groups.has(groupKey)) groups.set(groupKey, []);
      groups.get(groupKey)!.push(t);
    }

    return Array.from(groups.entries())
      .map(([groupKey, items]) => ({
        key: groupKey,
        label: groupKey === '__uncategorized__' ? '' : groupKey,
        items: [...items].sort(
          (a, b) => txnDayKey(b.date).localeCompare(txnDayKey(a.date)) || b.amount - a.amount,
        ),
        total: items.reduce((sum, txn) => sum + txn.amount, 0),
        kind: 'expenseGroup' as const,
      }))
      .sort((a, b) => b.total - a.total || a.label.localeCompare(b.label));
  }

  const categories = new Map<string, Txn[]>();

  for (const t of txns) {
    const day = txnDayKey(t.date);
    if (!categories.has(day)) categories.set(day, []);
    categories.get(day)!.push(t);
  }

  return Array.from(categories.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, items]) => ({
      key: date,
      label: date,
      items,
      total: items.reduce((sum, txn) => sum + txn.amount, 0),
      kind: 'date' as const,
    }));
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
    acc[t.category] += Math.max(0, t.amount);
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
  const map = new Map<
    string,
    {
      total: number;
      byCategory: Record<Category, number>;
      txns: Array<{ date: string; note: string; amount: number }>;
    }
  >();

  for (const t of txns) {
    const expGroup = t.expenseGroup || 'Uncategorized';
    const spend = Math.max(0, t.amount);
    const day = txnDayKey(t.date);

    if (!map.has(expGroup)) {
      map.set(expGroup, {
        total: 0,
        byCategory: { needs: 0, wants: 0, savings: 0 },
        txns: [],
      });
    }

    const entry = map.get(expGroup)!;
    entry.total += spend;
    entry.byCategory[t.category] += spend;
    entry.txns.push({
      date: day,
      note: t.note ?? '',
      amount: spend,
    });
  }

  const pickCategory = (byCategory: Record<Category, number>): Category => {
    const entries = Object.entries(byCategory) as Array<[Category, number]>;
    // choose the category with the largest total for this expGroup
    return entries.reduce((best, cur) => (cur[1] > best[1] ? cur : best))[0];
  };

  return Array.from(map.entries())
    .map(([expGroup, { total, byCategory, txns }]) => ({
      expGroup,
      total,
      category: pickCategory(byCategory),
      txns: txns.sort((a, b) => b.date.localeCompare(a.date) || b.amount - a.amount),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
});
