import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { AppDispatch, RootState } from '../store';
import { DEFAULT_START_DAY, MonthDoc } from '../../api/models/month-doc';
import { Txn } from '../../api/models/txn';
import { DEFAULT_PERCENTS, PercentTriple } from '../../api/types/percent.types';
import { monthKey } from '../../utils/services.util';
import {
  addTransaction,
  computeMonthSummary,
  deleteTransaction,
  onTransactionsSnapshot,
  persistMonthSummary,
  readMonth,
  updateTransaction,
  upsertMonth,
} from '../../api/services/budget.service';
import { startTxnsListener, stopTxnsListener } from '../../api/services/firebase.service';
import { monthKeyFromDate } from '../../utils/period.util';

type Status = 'idle' | 'loading' | 'ready' | 'error';
export type TxnTypeFilter = 'all' | 'needs' | 'wants' | 'savings';
export type SortKey = 'date' | 'amount';
type SortDir = 'asc' | 'desc';

interface TxnUiState {
  type: TxnTypeFilter;
  search: string;
  sortKey: SortKey;
  sortDir: SortDir;
}

interface BudgetState {
  month: string;
  doc: MonthDoc | null;
  txns: Txn[];
  status: Status;
  error?: string;
  _unsubTxns?: () => void; // internal
  ui: TxnUiState;
}

const initialState: BudgetState = {
  month: monthKey(),
  doc: null,
  txns: [],
  status: 'idle',
  ui: { type: 'all', search: '', sortKey: 'date', sortDir: 'desc' },
};

export const initBudget = createAsyncThunk(
  'budget/init',
  async ({ uid, month }: { uid: string; month?: string }, { dispatch, getState }) => {
    // 1) ensure settings are loaded (caller should dispatch loadSettings first; we guard anyway)
    const state: RootState = getState() as RootState;
    const startDay = state.settings?.startDay ?? DEFAULT_START_DAY;

    // 2) derive selected month (param > localStorage > computed current)
    const currentKey = monthKeyFromDate(new Date(), startDay);
    const stored = localStorage.getItem('month');
    const m = month || stored || currentKey;
    localStorage.setItem('month', m);

    const existing = await readMonth(uid, m);
    const doc = existing ?? (await upsertMonth(uid, m, { income: 0, percents: DEFAULT_PERCENTS }));

    startTxnsListener(
      onTransactionsSnapshot(uid, m, (txns) => {
        dispatch(_setTxns(txns));
      }),
    );

    return { doc, month: m };
  },
);

export const setIncomeForPeriod = createAsyncThunk<
  MonthDoc,
  { uid: string; month: string; income: number; startDay?: number },
  { state: RootState; dispatch: AppDispatch }
>('budget/setIncomeForPeriod', async ({ uid, month, income, startDay }, { getState, dispatch }) => {
  // 1) read current (if exists) to preserve percents (or use defaults)
  const existing = await readMonth(uid, month);
  const percents = existing?.percents ?? DEFAULT_PERCENTS;

  // 2) upsert month with new income (freeze startDay only on first create)
  const next = await upsertMonth(uid, month, { income, percents, startDay });

  // 3) summaries:
  const { budget } = getState();

  if (budget.month === month) {
    // target == selected period → we have txns; recompute full summary
    await dispatch(recomputeAndPersistSummary({ uid }));
  } else {
    // target != selected period → no txns loaded; optionally update snapshot bits
    // (keeps summary's income/allocations in sync without changing spent totals)
    if (existing?.summary) {
      const snapshot = {
        ...existing.summary,
        income: next.income,
        allocations: next.allocations,
        computedAt: new Date().toISOString(),
      };
      await persistMonthSummary(uid, month, snapshot);
    }
    // If no summary exists, it's fine—when user opens that period or you run backfill,
    // the full summary will be computed with txns.
  }

  return next;
});

// DELEGATE: keep the old thunk name for current-period updates
export const setIncomeThunk = createAsyncThunk<
  MonthDoc,
  { uid: string; income: number },
  { state: RootState; dispatch: AppDispatch }
>('budget/setIncome', async ({ uid, income }, { getState, dispatch }) => {
  const { month } = getState().budget;
  // use startDay only if the doc might be created the first time
  const startDay = (getState() as RootState as any)?.settings?.startDay ?? DEFAULT_START_DAY;

  // Delegate to the generic thunk
  return await dispatch(setIncomeForPeriod({ uid, month, income, startDay })).unwrap();
});

export const setPercentsThunk = createAsyncThunk<
  MonthDoc,
  { uid: string; percents: PercentTriple },
  { state: RootState; dispatch: AppDispatch }
>('budget/setPercents', async ({ uid, percents }, { getState, rejectWithValue, dispatch }) => {
  try {
    const { month, doc } = getState().budget;
    const income = doc?.income ?? 0;
    const next = await upsertMonth(uid, month, { income, percents });
    await dispatch(recomputeAndPersistSummary({ uid }));
    return next;
  } catch (error: any) {
    return rejectWithValue(error.message ?? 'Failed to set percents');
  }
});

export const changeMonthThunk = createAsyncThunk<
  { doc: MonthDoc; month: string },
  { uid: string; month: string }
>('budget/changeMonth', async ({ uid, month }, { dispatch }) => {
  // stop any existing listener
  stopTxnsListener();

  localStorage.setItem('month', month);

  const doc =
    (await readMonth(uid, month)) ??
    (await upsertMonth(uid, month, { income: 0, percents: DEFAULT_PERCENTS }));

  // restart live listener for the new month
  startTxnsListener(onTransactionsSnapshot(uid, month, (txns) => dispatch(_setTxns(txns))));

  return { doc, month };
});

export const addTxnThunk = createAsyncThunk<
  string,
  { uid: string; txn: Omit<Txn, 'id'> },
  { state: RootState; dispatch: AppDispatch }
>('budget/addTxn', async ({ uid, txn }, { getState, dispatch }) => {
  const { month } = getState().budget;
  const id = await addTransaction(uid, month, txn);
  // recompute once mutation succeeds
  await dispatch(recomputeAndPersistSummary({ uid }));
  return id;
});

export const updateTxnThunk = createAsyncThunk<
  void,
  { uid: string; id: string; patch: Partial<Omit<Txn, 'id'>> },
  { state: RootState; dispatch: AppDispatch }
>('budget/updateTxn', async ({ uid, id, patch }, { getState, dispatch }) => {
  const { month } = getState().budget;
  await updateTransaction(uid, month, id, patch);
  await dispatch(recomputeAndPersistSummary({ uid }));
});

export const deleteTxnThunk = createAsyncThunk<
  void,
  { uid: string; id: string },
  { state: RootState; dispatch: AppDispatch }
>('budget/deleteTxn', async ({ uid, id }, { getState, dispatch }) => {
  const { month } = getState().budget;
  await deleteTransaction(uid, month, id);
  await dispatch(recomputeAndPersistSummary({ uid }));
});

export const recomputeAndPersistSummary = createAsyncThunk<
  void,
  { uid: string },
  { state: RootState }
>('budget/recomputeAndPersistSummary', async ({ uid }, { getState }) => {
  const state = getState().budget;
  const doc = state.doc;
  if (!doc) return;

  // Use txns that are already in memory for THIS period (no extra reads needed)
  const txns = state.txns;
  const summary = computeMonthSummary(doc, txns);
  await persistMonthSummary(uid, state.month, summary);
});

const budgetSlice = createSlice({
  name: 'budget',
  initialState,
  reducers: {
    setMonth(state, action: PayloadAction<string>) {
      state.month = action.payload;
      localStorage.setItem('month', state.month);
    },
    // Internal: keep txns in sync from Firestore listener
    _setTxns(state, action: PayloadAction<Txn[]>) {
      state.txns = action.payload;
    },
    // Optional: update doc locally when you adjust inputs before round-trip
    _setDoc(state, action: PayloadAction<MonthDoc>) {
      state.doc = action.payload;
    },
    // Clean up listeners (e.g., on logout or month change)
    cleanupListeners() {
      stopTxnsListener();
    },

    setTxnTypeFilter(state, action: PayloadAction<TxnTypeFilter>) {
      state.ui.type = action.payload;
    },
    setTxnSearch(state, action: PayloadAction<string>) {
      state.ui.search = action.payload;
    },
    setTxnSort(state, action: PayloadAction<{ key: SortKey; dir: SortDir }>) {
      state.ui.sortKey = action.payload.key;
      state.ui.sortDir = action.payload.dir;
    },
    resetTxnFilters(state) {
      state.ui = { type: 'all', search: '', sortKey: 'date', sortDir: 'desc' };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initBudget.pending, (s) => {
        s.status = 'loading';
        s.error = undefined;
      })
      .addCase(initBudget.fulfilled, (s, { payload }) => {
        s.status = 'ready';
        s.doc = payload.doc;
        s.month = payload.month;
      })
      .addCase(initBudget.rejected, (s, a) => {
        s.status = 'error';
        s.error = a.error.message;
      })
      .addCase(setIncomeThunk.fulfilled, (s, { payload }) => {
        s.doc = payload;
      })
      .addCase(setIncomeForPeriod.pending, (s, { payload }) => {
        s.status = 'loading';
        s.error = undefined;
      })
      .addCase(setIncomeForPeriod.fulfilled, (s, { payload }) => {
        s.doc = payload;
        s.error = undefined;
        s.status = 'ready';
      })
      .addCase(setIncomeForPeriod.rejected, (s, { payload }) => {
        s.status = 'error';
        s.error = payload as any;
      })
      .addCase(setPercentsThunk.fulfilled, (s, { payload }) => {
        s.doc = payload;
      })
      .addCase(changeMonthThunk.pending, (s) => {
        s.status = 'loading';
        s.error = undefined;
      })
      .addCase(changeMonthThunk.fulfilled, (s, { payload }) => {
        s.status = 'ready';
        s.doc = payload.doc;
        s.month = payload.month;
        // txns will stream in via _setTxns from the live listener
      })
      .addCase(changeMonthThunk.rejected, (s, a) => {
        s.status = 'error';
        s.error = a.error.message;
      })

      // --- update transaction
      .addCase(updateTxnThunk.pending, (s) => {
        s.status = 'loading';
        s.error = undefined;
      })
      .addCase(updateTxnThunk.fulfilled, (s) => {
        s.status = 'ready';
        // No local mutation needed; listener will sync txns
      })
      .addCase(updateTxnThunk.rejected, (s, a) => {
        s.status = 'error';
        s.error = a.error.message ?? 'Failed to update transaction';
      })

      // --- delete transaction
      .addCase(deleteTxnThunk.pending, (s) => {
        s.status = 'loading';
        s.error = undefined;
      })
      .addCase(deleteTxnThunk.fulfilled, (s) => {
        s.status = 'ready';
        // No local mutation needed; listener will sync txns
      })
      .addCase(deleteTxnThunk.rejected, (s, a) => {
        s.status = 'error';
        s.error = a.error.message ?? 'Failed to delete transaction';
      });
  },
});

export const {
  setMonth,
  _setTxns,
  _setDoc,
  cleanupListeners,
  setTxnTypeFilter,
  setTxnSearch,
  setTxnSort,
  resetTxnFilters,
} = budgetSlice.actions;
export default budgetSlice.reducer;
