import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { MonthDoc } from '../../api/models/month-doc';
import { listMonthsWithSummary } from '../../api/services/budget.service';

export type HistoryRow = MonthDoc & { id: string; _cursor?: any };

type HistoryState = {
  rows: HistoryRow[];
  nextCursor: any | null;
  status: 'idle' | 'loading' | 'ready' | 'error';
  error?: string;
};

const initialState: HistoryState = { rows: [], nextCursor: null, status: 'idle' };

export const loadHistoryPage = createAsyncThunk(
  'history/loadPage',
  async (
    {
      uid,
      fromISO,
      toISO,
      pageSize,
    }: { uid: string; fromISO?: string; toISO?: string; pageSize?: number },
    { getState },
  ) => {
    const state = getState() as RootState;
    const cursor = state.history.nextCursor ?? null;
    const { items, nextCursor } = await listMonthsWithSummary(uid, {
      fromISO,
      toISO,
      pageSize,
      pageAfter: cursor,
    });
    return { items, nextCursor };
  },
);

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
      s.status = 'error';
      s.error = a.error.message ?? 'Failed to load history';
    });
  },
});

export const { resetHistory } = historySlice.actions;
export default historySlice.reducer;
