import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../store';
import { MonthDoc } from '../../api/models/month-doc';
import { Txn } from '../../api/models/txn';
import { DEFAULT_PERCENTS, PercentTriple } from '../../api/types/percent.types';
import { monthKey } from '../../utils/services.util';
import {
  addTransaction,
  onTransactionsSnapshot,
  readMonth,
  upsertMonth,
} from '../../api/services/budget.service';
import { startTxnsListener, stopTxnsListener } from '../../api/services/firebase.service';

type Status = 'idle' | 'loading' | 'ready' | 'error';

interface BudgetState {
  month: string;
  doc: MonthDoc | null;
  txns: Txn[];
  status: Status;
  error?: string;
  _unsubTxns?: () => void; // internal
}

const initialState: BudgetState = {
  month: monthKey(),
  doc: null,
  txns: [],
  status: 'idle',
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
      });
  },
});

export const { setMonth, _setTxns, _setDoc, cleanupListeners } = budgetSlice.actions;
export default budgetSlice.reducer;
