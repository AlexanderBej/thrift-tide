import { RootState } from '../store';

/** Raw budget status (idle/loading/ready/error). */
export const selectBudgetStatus = (s: RootState) => s.budget.status;

/** The currently selected budget period key, e.g. "2025-10" (period start’s YYYY-MM). */
export const selectBudgetMonth = (s: RootState) => s.budget.month;

/** The MonthDoc for the selected period (income, percents, allocations). */
export const selectBudgetDoc = (s: RootState) => s.budget.doc;

/** The period income number (0 if missing). */
export const selectBudgetTotal = (s: RootState) => s.budget.doc?.income ?? 0;

/** All transactions loaded in memory (unfiltered). */
export const selectBudgetTxns = (s: RootState) => s.budget.txns;

/** UI state for txn list (type/search/sort). */
export const selectTxnUi = (s: RootState) => s.budget.ui;
