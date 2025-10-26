import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../store';
import { MonthDoc } from '../../api/models/month-doc';
import { Txn } from '../../api/models/txn';
import { DEFAULT_PERCENTS, PercentTriple } from '../../api/types/percent.types';
import { monthKey } from '../../utils/services.util';
import {
  addTransaction,
  deleteTransaction,
  onTransactionsSnapshot,
  readMonth,
  updateTransaction,
  upsertMonth,
} from '../../api/services/budget.service';
import { startTxnsListener, stopTxnsListener } from '../../api/services/firebase.service';

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
  async ({ uid, month }: { uid: string; month?: string }, { dispatch }) => {
    const m = month || localStorage.getItem('month') || monthKey();
    localStorage.setItem('month', m);

    const existing = await readMonth(uid, m);
    const doc = existing ?? (await upsertMonth(uid, m, { income: 0, percents: DEFAULT_PERCENTS }));

    // start Firestore live listener; dispatch inside callback
    startTxnsListener(
      onTransactionsSnapshot(uid, m, (txns) => {
        dispatch(_setTxns(txns)); // <-- action contains only plain arrays/objects
      }),
    );

    // ✅ payload contains only serializable values
    return { doc, month: m };
  },
);

export const setIncomeThunk = createAsyncThunk<
  MonthDoc,
  { uid: string; income: number },
  { state: RootState }
>('budget/setIncome', async ({ uid, income }, { getState, rejectWithValue }) => {
  try {
    const { month, doc } = getState().budget;
    const percents = doc?.percents ?? DEFAULT_PERCENTS;
    return await upsertMonth(uid, month, { income, percents }); // always MonthDoc
  } catch (e: any) {
    return rejectWithValue(e.message ?? 'Failed to set income');
  }
});

export const setPercentsThunk = createAsyncThunk<
  MonthDoc,
  { uid: string; percents: PercentTriple },
  { state: RootState }
>('budget/setPercents', async ({ uid, percents }, { getState, rejectWithValue }) => {
  try {
    const { month, doc } = getState().budget;
    const income = doc?.income ?? 0;
    return upsertMonth(uid, month, { income, percents });
  } catch (error: any) {
    return rejectWithValue(error.message ?? 'Failed to set percents');
  }
});

export const addTxnThunk = createAsyncThunk<
  string,
  { uid: string; txn: Omit<Txn, 'id'> },
  { state: RootState }
>('budget/addTxn', async ({ uid, txn }, { getState }) => {
  const { month } = getState().budget;
  return addTransaction(uid, month, txn);
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

export const updateTxnThunk = createAsyncThunk<
  void,
  { uid: string; id: string; patch: Partial<Omit<Txn, 'id'>> },
  { state: RootState }
>('budget/updateTxn', async ({ uid, id, patch }, { getState }) => {
  const { month } = getState().budget;
  await updateTransaction(uid, month, id, patch);
});

export const deleteTxnThunk = createAsyncThunk<
  void,
  { uid: string; id: string },
  { state: RootState }
>('budget/deleteTxn', async ({ uid, id }, { getState }) => {
  const { month } = getState().budget;
  await deleteTransaction(uid, month, id);
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
