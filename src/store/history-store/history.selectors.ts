import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { HistoryRow } from './history.slice';

const sortByStart = (a: any, b: any) => String(a.periodStart).localeCompare(String(b.periodStart));

export const selectHistoryRows = (s: RootState) => (s as any).history.rows as HistoryRow[];
export const selectHistoryStatus = (s: RootState) => (s as any).history.status;
export const selectHistoryHasMore = (s: RootState) => Boolean((s as any).history.nextCursor);

export const selectTrendTotalSpent = createSelector([selectHistoryRows], (rows) =>
  rows
    .filter((r) => r.summary?.totalSpent != null)
    .sort((a, b) => a.periodStart.localeCompare(b.periodStart))
    .map((r) => ({ x: r.month, y: r.summary?.totalSpent })),
);

export const selectTrendSplit = createSelector([selectHistoryRows], (rows) =>
  rows
    .filter((r) => r.summary?.spent)
    .sort((a, b) => a.periodStart.localeCompare(b.periodStart))
    .map((r) => ({
      month: r.month,
      needs: r.summary?.spent.needs,
      wants: r.summary?.spent.wants,
      savings: r.summary?.spent.savings,
    })),
);

export const selectTrendTotalSpentSeries = createSelector([selectHistoryRows], (rows) => {
  const data = rows
    .filter((r) => r.summary?.totalSpent != null)
    .sort(sortByStart)
    .map((r) => ({ x: r.month, y: r.summary!.totalSpent }));
  return [{ id: 'Total Spent', color: 'var(--accent)', data }];
});

export const selectSplitBarData = createSelector([selectHistoryRows], (rows) =>
  rows
    .filter((r) => r.summary?.spent)
    .sort(sortByStart)
    .map((r) => ({
      category: r.month,
      allocated:
        (r.summary?.allocations.needs ?? 0) +
        (r.summary?.allocations.wants ?? 0) +
        (r.summary?.allocations.savings ?? 0),
      spent: r.summary!.totalSpent,
      needs: r.summary!.spent.needs,
      wants: r.summary!.spent.wants,
      savings: r.summary!.spent.savings,
    })),
);

export const selectLatestDonutItems = createSelector([selectHistoryRows], (rows) => {
  if (!rows.length || !rows[rows.length - 1].summary?.spent) return [];
  const r = rows.slice().sort(sortByStart)[rows.length - 1];
  const s = r.summary!.spent;
  const alloc = r.summary!.allocations;
  return [
    { id: 'Needs', label: 'Needs', allocated: alloc.needs, used: s.needs, color: 'var(--needs)' },
    { id: 'Wants', label: 'Wants', allocated: alloc.wants, used: s.wants, color: 'var(--wants)' },
    {
      id: 'Savings',
      label: 'Savings',
      allocated: alloc.savings,
      used: s.savings,
      color: 'var(--savings)',
    },
  ];
});
