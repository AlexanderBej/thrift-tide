import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../store';
import {
  emptyMonthSummary,
  monthKey,
  monthKeyFromDate,
  periodBounds,
  representativeDateFromMonthKey,
} from '@shared/utils';
import { MonthDoc, Txn, DEFAULT_START_DAY } from '@api/models';
import {
  createOrUpdateMonth,
  startTxnsListener,
  onTransactionsSnapshot,
  readMonth,
  updateMonth,
  createMonth,
  persistMonthSummary,
  stopTxnsListener,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  computeMonthSummary,
  deleteAllTransactionsForMonth,
} from '@api/services';
import { createAppAsyncThunk, PercentTriple } from '@api/types';

// type Status = 'idle' | 'loading' | 'ready' | 'error';
export type TxnTypeFilter = 'all' | 'needs' | 'wants' | 'savings';
export type SortKey = 'date' | 'amount' | 'expenseGroup';
type SortDir = 'asc' | 'desc';

type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';
type MutateStatus = 'idle' | 'loading' | 'error';

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
  loadStatus: LoadStatus;
  mutateStatus: MutateStatus;
  error?: string;
  _unsubTxns?: () => void; // internal
  // _unsubL
  ui: TxnUiState;
}

const initialState: BudgetState = {
  month: monthKey(),
  doc: null,
  txns: [],
  loadStatus: 'idle',
  mutateStatus: 'idle',
  ui: { type: 'all', search: '', sortKey: 'date', sortDir: 'desc' },
};

export const initBudget = createAppAsyncThunk<
  { doc: MonthDoc; month: string },
  { uid: string; month?: string }
>('budget/init', async ({ uid, month }, { dispatch, getState, rejectWithValue }) => {
  try {
    // 1) ensure settings are loaded (caller should dispatch loadSettings first; we guard anyway)
    const state: RootState = getState();
    const startDay = state.settings?.startDay ?? DEFAULT_START_DAY;

    // 2) derive selected month (param > localStorage > computed current)
    const currentKey = monthKeyFromDate(new Date(), startDay);
    const stored = localStorage.getItem('month');
    const m = month || stored || currentKey;
    localStorage.setItem('month', m);

    const doc = await createOrUpdateMonth(uid, m, {});

    startTxnsListener(
      onTransactionsSnapshot(uid, m, (txns) => {
        dispatch(_setTxns(txns));
      }),
    );

    return { doc, month: m };
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const setIncomeForPeriod = createAppAsyncThunk<
  MonthDoc,
  { uid: string; month: string; income: number }
>(
  'budget/setIncomeForPeriod',
  async ({ uid, month, income }, { getState, dispatch, rejectWithValue }) => {
    try {
      // 1) read current (if exists) to preserve percents (or use defaults)
      const existing = await readMonth(uid, month);
      // const percents = existing?.percents ?? DEFAULT_PERCENTS;

      // 2) upsert month with new income (freeze startDay only on first create)
      const next = existing
        ? await updateMonth(uid, month, { income })
        : await createMonth(uid, month, {});

      // 3) summaries:
      const { budget } = getState();

      if (budget.month === month) {
        // target == selected period → we have txns; recompute full summary
        await dispatch(recomputeAndPersistSummary({ uid }));
      } else {
        // target != selected period → no txns loaded; optionally update snapshot bits
        if (existing?.summary) {
          const snapshot = {
            ...existing.summary,
            income: next.income,
            allocations: next.allocations,
            computedAt: new Date().toISOString(),
          };
          await persistMonthSummary(uid, month, snapshot);
        }
      }

      return next;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

// DELEGATE: keep the old thunk name for current-period updates
export const setIncomeThunk = createAppAsyncThunk<MonthDoc, { uid: string; income: number }>(
  'budget/setIncome',
  async ({ uid, income }, { getState, dispatch }) => {
    const { month } = getState().budget;
    // Delegate to the generic thunk
    return await dispatch(setIncomeForPeriod({ uid, month, income })).unwrap();
  },
);

export const setPercentsThunk = createAppAsyncThunk<
  MonthDoc,
  { uid: string; percents: PercentTriple }
>('budget/setPercents', async ({ uid, percents }, { getState, rejectWithValue, dispatch }) => {
  try {
    const { month } = getState().budget;
    const next = await updateMonth(uid, month, { percents });
    await dispatch(recomputeAndPersistSummary({ uid }));
    return next;
  } catch (error: any) {
    return rejectWithValue(error.message ?? 'Failed to set percents');
  }
});

export const updateMonthStartDayThunk = createAppAsyncThunk<
  MonthDoc,
  { uid: string; startDay: number }
>('budget/updateStartDay', async ({ uid, startDay }, { getState, rejectWithValue, dispatch }) => {
  try {
    const { month } = getState().budget;
    const next = await updateMonth(uid, month, { startDay });
    await dispatch(recomputeAndPersistSummary({ uid }));
    return next;
  } catch (error: any) {
    return rejectWithValue(error.message ?? 'Failed to update start day for this period');
  }
});

export const changeMonthThunk = createAppAsyncThunk<
  { doc: MonthDoc; month: string },
  { uid: string; month: string }
>('budget/changeMonth', async ({ uid, month }, { dispatch, rejectWithValue }) => {
  try {
    // stop any existing listener
    stopTxnsListener();

    localStorage.setItem('month', month);

    const doc = (await readMonth(uid, month)) ?? (await createOrUpdateMonth(uid, month, {}));

    // restart live listener for the new month
    startTxnsListener(onTransactionsSnapshot(uid, month, (txns) => dispatch(_setTxns(txns))));

    return { doc, month };
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const addTxnThunk = createAppAsyncThunk<string, { uid: string; txn: Omit<Txn, 'id'> }>(
  'budget/addTxn',
  async ({ uid, txn }, { getState, dispatch, rejectWithValue }) => {
    try {
      const { month } = getState().budget;
      const id = await addTransaction(uid, month, txn);
      // recompute once mutation succeeds
      await dispatch(recomputeAndPersistSummary({ uid }));
      return id;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const updateTxnThunk = createAppAsyncThunk<
  void,
  { uid: string; id: string; patch: Partial<Omit<Txn, 'id'>> }
>('budget/updateTxn', async ({ uid, id, patch }, { getState, dispatch, rejectWithValue }) => {
  try {
    const { month } = getState().budget;
    await updateTransaction(uid, month, id, patch);
    await dispatch(recomputeAndPersistSummary({ uid }));
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const deleteTxnThunk = createAppAsyncThunk<void, { uid: string; id: string }>(
  'budget/deleteTxn',
  async ({ uid, id }, { getState, dispatch, rejectWithValue }) => {
    try {
      const { month } = getState().budget;
      await deleteTransaction(uid, month, id);
      await dispatch(recomputeAndPersistSummary({ uid }));
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const recomputeAndPersistSummary = createAppAsyncThunk<void, { uid: string }>(
  'budget/recomputeAndPersistSummary',
  async ({ uid }, { getState }) => {
    const state = getState().budget;
    const doc = state.doc;
    if (!doc) return;

    // Use txns that are already in memory for THIS period (no extra reads needed)
    const txns = state.txns;
    const summary = computeMonthSummary(doc, txns);
    await persistMonthSummary(uid, state.month, summary);
  },
);

export const resetCurrentPeriodThunk = createAppAsyncThunk<void, { uid: string }>(
  'budget/resetCurrentPeriod',
  async ({ uid }, { getState, dispatch, rejectWithValue }) => {
    try {
      const { month, doc } = getState().budget;
      if (!doc) return;

      // Stop listener to avoid lots of intermediate snapshot updates during deletion
      stopTxnsListener();

      // 1) Delete all txns in Firestore for this month
      await deleteAllTransactionsForMonth(uid, month);

      // 2) Immediately update local UI
      dispatch(_setTxns([]));

      // 3) Immediately clear cached summary in Firestore
      // (prevents stale month summary if user navigates/history/list reads it)
      await persistMonthSummary(uid, month, emptyMonthSummary(doc));

      // 4) Restart listener for this month
      startTxnsListener(onTransactionsSnapshot(uid, month, (txns) => dispatch(_setTxns(txns))));

      return;
    } catch (error: any) {
      return rejectWithValue(error?.message ?? 'Failed to reset period');
    }
  },
);

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
    updateBudgetStartDay(state, action: PayloadAction<number>) {
      if (state.doc) {
        const month = state.month;
        const { start, end } = periodBounds(
          representativeDateFromMonthKey(month, action.payload),
          action.payload,
        );

        state.doc.periodStart = start.toISOString();
        state.doc.periodEnd = end.toISOString();
      }
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
        s.loadStatus = 'loading';
        s.error = undefined;
      })
      .addCase(initBudget.fulfilled, (s, { payload }) => {
        s.loadStatus = 'ready';
        s.doc = payload?.doc ?? null;
        s.month = payload?.month ?? '';
      })
      .addCase(initBudget.rejected, (s, a) => {
        s.loadStatus = 'error';
        s.error = a.error.message;
      })

      .addCase(setIncomeThunk.pending, (s) => {
        s.mutateStatus = 'loading';
        s.error = undefined;
      })
      .addCase(setIncomeThunk.fulfilled, (s, { payload }) => {
        s.mutateStatus = 'idle';
        s.doc = payload;
      })
      .addCase(setIncomeThunk.rejected, (s, a) => {
        s.mutateStatus = 'error';
        s.error = a.error.message;
      })

      .addCase(setIncomeForPeriod.pending, (s) => {
        s.mutateStatus = 'loading';
        s.error = undefined;
      })
      .addCase(setIncomeForPeriod.fulfilled, (s, { payload }) => {
        s.doc = payload;
        s.mutateStatus = 'idle';
      })
      .addCase(setIncomeForPeriod.rejected, (s, a) => {
        s.mutateStatus = 'error';
        s.error = a.error.message;
      })

      .addCase(updateMonthStartDayThunk.pending, (s) => {
        s.error = undefined;
        s.mutateStatus = 'loading';
      })
      .addCase(updateMonthStartDayThunk.fulfilled, (s, { payload }) => {
        s.doc = payload;
        s.mutateStatus = 'idle';
      })
      .addCase(updateMonthStartDayThunk.rejected, (s, a) => {
        s.error = a.error.message;
        s.mutateStatus = 'error';
      })

      .addCase(setPercentsThunk.pending, (s) => {
        s.error = undefined;
        s.mutateStatus = 'loading';
      })
      .addCase(setPercentsThunk.fulfilled, (s, { payload }) => {
        s.doc = payload;
        s.mutateStatus = 'idle';
      })
      .addCase(setPercentsThunk.rejected, (s, a) => {
        s.error = a.error.message;
        s.mutateStatus = 'error';
      })

      .addCase(changeMonthThunk.pending, (s) => {
        s.loadStatus = 'loading';
        s.error = undefined;
      })
      .addCase(changeMonthThunk.fulfilled, (s, { payload }) => {
        s.loadStatus = 'ready';
        s.doc = payload.doc;
        s.month = payload.month;
      })
      .addCase(changeMonthThunk.rejected, (s, a) => {
        s.loadStatus = 'error';
        s.error = a.error.message;
      })

      // --- update transaction
      .addCase(updateTxnThunk.pending, (s) => {
        s.mutateStatus = 'loading';
        s.error = undefined;
      })
      .addCase(updateTxnThunk.fulfilled, (s) => {
        s.mutateStatus = 'idle';
      })
      .addCase(updateTxnThunk.rejected, (s, a) => {
        s.mutateStatus = 'error';
        s.error = a.error.message;
      })

      // --- delete transaction
      .addCase(deleteTxnThunk.pending, (s) => {
        s.mutateStatus = 'loading';
        s.error = undefined;
      })
      .addCase(deleteTxnThunk.fulfilled, (s) => {
        s.mutateStatus = 'idle';
      })
      .addCase(deleteTxnThunk.rejected, (s, a) => {
        s.mutateStatus = 'error';
        s.error = a.error.message;
      })

      // --- clear whole period
      .addCase(resetCurrentPeriodThunk.pending, (s) => {
        s.mutateStatus = 'loading';
        s.error = undefined;
      })
      .addCase(resetCurrentPeriodThunk.fulfilled, (s) => {
        s.mutateStatus = 'idle';
      })
      .addCase(resetCurrentPeriodThunk.rejected, (s, a) => {
        s.mutateStatus = 'error';
        s.error = a.error.message;
      });
  },
});

export const {
  setMonth,
  _setTxns,
  _setDoc,
  updateBudgetStartDay,
  cleanupListeners,
  setTxnTypeFilter,
  setTxnSearch,
  setTxnSort,
  resetTxnFilters,
} = budgetSlice.actions;
export default budgetSlice.reducer;
