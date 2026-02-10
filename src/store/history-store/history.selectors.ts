import { createSelector } from '@reduxjs/toolkit';

import { RootState } from '../store';
import { HistoryRow } from './history.slice';
import { HistoryDocWithSummary, MonthDocSummary } from '@api/models';

export const selectHistoryRows = (s: RootState) => (s as any).history.rows as HistoryRow[];
export const selectHistoryRecents = (s: RootState) => (s as any).history.recents as HistoryRow[];
export const selectHistoryStatus = (s: RootState) => (s as any).history.status;
export const selectHistoryHasMore = (s: RootState) => Boolean((s as any).history.rowsNextCursor);

export const selectHistoryDocsWithPercentsAndSummary = createSelector(
  [(s: RootState) => s.history.rows],
  (rows): HistoryDocWithSummary[] =>
    rows
      .filter((r): r is typeof r & { summary: MonthDocSummary } => !!r.summary)
      .map((r) => ({
        id: r.id,
        month: r.month,
        percents: r.percents,
        summary: r.summary,
      })),
);
