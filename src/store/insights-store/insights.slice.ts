import { createSlice } from '@reduxjs/toolkit';

import { MonthDoc } from '@api/models';
import { listMonthsWithSummary } from '@api/services';
import { createAppAsyncThunk } from '@api/types';

export type InsightsHistoryRow = MonthDoc & { id: string };

type InsightsState = {
  rows: InsightsHistoryRow[];
  status: 'idle' | 'loading' | 'ready' | 'error';
  error?: string;
};

const initialState: InsightsState = {
  rows: [],
  status: 'idle',
};

const INSIGHTS_FETCH_PAGE_SIZE = 12;
const INSIGHTS_USABLE_LIMIT = 6;
const INSIGHTS_SCAN_LIMIT = 60;

export const loadInsightsHistory = createAppAsyncThunk<
  { items: InsightsHistoryRow[] },
  { uid: string }
>('insights/loadHistory', async ({ uid }, { rejectWithValue }) => {
  try {
    const closedBeforeISO = new Date().toISOString();
    const items: InsightsHistoryRow[] = [];
    let pageAfterPeriodEnd: string | null = null;

    while (items.filter((item) => item.summary).length < INSIGHTS_USABLE_LIMIT) {
      const page: { items: InsightsHistoryRow[]; nextCursor: string | null } = await listMonthsWithSummary(uid, {
        pageSize: INSIGHTS_FETCH_PAGE_SIZE,
        closedBeforeISO,
        pageAfterPeriodEnd,
      }) as { items: InsightsHistoryRow[]; nextCursor: string | null };

      items.push(...page.items);
      pageAfterPeriodEnd = page.nextCursor ?? null;

      if (!pageAfterPeriodEnd || page.items.length === 0 || items.length >= INSIGHTS_SCAN_LIMIT) break;
    }

    return { items };
  } catch (error) {
    return rejectWithValue('Failed to load insights');
  }
});

const insightsSlice = createSlice({
  name: 'insights',
  initialState,
  reducers: {
    resetInsights(s) {
      s.rows = [];
      s.status = 'idle';
      s.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadInsightsHistory.pending, (s) => {
        s.status = 'loading';
        s.error = undefined;
      })
      .addCase(loadInsightsHistory.fulfilled, (s, { payload }) => {
        s.status = 'ready';
        s.rows = payload.items;
      })
      .addCase(loadInsightsHistory.rejected, (s, action) => {
        s.status = 'error';
        s.error = (action.payload as string) ?? action.error.message ?? 'Failed to load insights';
      });
  },
});

export const { resetInsights } = insightsSlice.actions;
export default insightsSlice.reducer;
