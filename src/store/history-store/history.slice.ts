import { createSlice } from '@reduxjs/toolkit';

import { RootState } from '../store';
import { MonthDoc } from '@api/models';
import { listMonthsWithSummary, listRecentMonths } from '@api/services';
import { createAppAsyncThunk } from '@api/types';

export type HistoryRow = MonthDoc & { id: string };

type HistoryState = {
  rows: HistoryRow[];
  rowsNextCursor: string | null;
  recents: any[] | null;
  recentsNextCursor: string | null;

  status: 'idle' | 'loading' | 'ready' | 'error';
  error?: string;
};

const initialState: HistoryState = {
  rows: [],
  rowsNextCursor: null,
  status: 'idle',
  recents: null,
  recentsNextCursor: null,
};

export const loadHistoryPage = createAppAsyncThunk<
  { items: HistoryRow[]; rowsNextCursor: any | null },
  { uid: string; fromISO?: string; toISO?: string; pageSize?: number }
>('history/loadPage', async ({ uid, fromISO, toISO, pageSize }, { getState, rejectWithValue }) => {
  try {
    const state = getState() as RootState; // getState already typed; explicit cast is fine or can be removed
    const cursor = state.history.rowsNextCursor ?? null;

    const { items, nextCursor } = await listMonthsWithSummary(uid, {
      fromISO,
      toISO,
      pageSize,
      pageAfterPeriodStart: cursor,
    });

    return { items: items as HistoryRow[], rowsNextCursor: nextCursor ?? null };
  } catch (error) {
    return rejectWithValue('Failed to load history page'); // typed rejectValue (string)
  }
});

export const loadRecentMonths = createAppAsyncThunk<
  { items: HistoryRow[]; recentsNextCursor: any | null },
  { uid: string; pageSize?: number }
>('history/loadRecentMonths', async ({ uid, pageSize }, { getState, rejectWithValue }) => {
  try {
    const state = getState() as RootState; // getState already typed; explicit cast is fine or can be removed
    const cursor = state.history.recentsNextCursor ?? null;

    const { items, nextCursor } = await listRecentMonths(uid, {
      pageSize,
      pageAfterPeriodStart: cursor,
    });

    return { items: items as HistoryRow[], recentsNextCursor: nextCursor ?? null };
  } catch (error) {
    return rejectWithValue('Failed to load recent months'); // typed rejectValue (string)
  }
});

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    resetHistory(s) {
      s.rows = [];
      s.rowsNextCursor = null;
      s.status = 'idle';
      s.error = undefined;
    },
  },
  extraReducers: (b) => {
    b.addCase(loadHistoryPage.pending, (s) => {
      s.status = 'loading';
      s.error = undefined;
    });
    b.addCase(loadHistoryPage.fulfilled, (s, { payload }) => {
      s.status = 'ready';
      s.rows = [...s.rows, ...payload.items];
      s.rowsNextCursor = payload.rowsNextCursor;
    });
    b.addCase(loadHistoryPage.rejected, (s, a) => {
      // prefer payload when using rejectWithValue
      s.status = 'error';
      s.error = (a.payload as string) ?? a.error.message ?? 'Failed to load history';
    });

    b.addCase(loadRecentMonths.pending, (s) => {
      s.status = 'loading';
      s.error = undefined;
    });
    b.addCase(loadRecentMonths.fulfilled, (s, { payload }) => {
      s.status = 'ready';
      s.recents = [...s.rows, ...payload.items];
      s.rowsNextCursor = payload.recentsNextCursor;
    });
    b.addCase(loadRecentMonths.rejected, (s, a) => {
      // prefer payload when using rejectWithValue
      s.status = 'error';
      s.error = (a.payload as string) ?? a.error.message ?? 'Failed to load recent months';
    });
  },
});

export const { resetHistory } = historySlice.actions;
export default historySlice.reducer;
