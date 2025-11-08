import { createSlice } from '@reduxjs/toolkit';

import { RootState } from '../store';
import { MonthDoc } from '@api/models';
import { listMonthsWithSummary } from '@api/services';
import { createAppAsyncThunk } from '@api/types';

export type HistoryRow = MonthDoc & { id: string; _cursor?: any };

type HistoryState = {
  rows: HistoryRow[];
  nextCursor: any | null;
  status: 'idle' | 'loading' | 'ready' | 'error';
  error?: string;
};

const initialState: HistoryState = { rows: [], nextCursor: null, status: 'idle' };

export const loadHistoryPage = createAppAsyncThunk<
  { items: HistoryRow[]; nextCursor: any | null },
  { uid: string; fromISO?: string; toISO?: string; pageSize?: number }
>('history/loadPage', async ({ uid, fromISO, toISO, pageSize }, { getState, rejectWithValue }) => {
  try {
    const state = getState() as RootState; // getState already typed; explicit cast is fine or can be removed
    const cursor = state.history.nextCursor ?? null;

    const { items, nextCursor } = await listMonthsWithSummary(uid, {
      fromISO,
      toISO,
      pageSize,
      pageAfter: cursor,
    });

    return { items: items as HistoryRow[], nextCursor: nextCursor ?? null };
  } catch (error) {
    return rejectWithValue('Failed to load history page'); // typed rejectValue (string)
  }
});

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    resetHistory(s) {
      s.rows = [];
      s.nextCursor = null;
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
      s.nextCursor = payload.nextCursor;
    });
    b.addCase(loadHistoryPage.rejected, (s, a) => {
      // prefer payload when using rejectWithValue
      s.status = 'error';
      s.error = (a.payload as string) ?? a.error.message ?? 'Failed to load history';
    });
  },
});

export const { resetHistory } = historySlice.actions;
export default historySlice.reducer;
