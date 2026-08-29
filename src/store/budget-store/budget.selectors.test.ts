jest.mock('@api/services', () => ({
  createOrUpdateMonth: jest.fn(),
  startTxnsListener: jest.fn(),
  onTransactionsSnapshot: jest.fn(),
  readMonth: jest.fn(),
  updateMonth: jest.fn(),
  createMonth: jest.fn(),
  persistMonthSummary: jest.fn(),
  stopTxnsListener: jest.fn(),
  addTransaction: jest.fn(),
  updateTransaction: jest.fn(),
  deleteTransaction: jest.fn(),
  readTransaction: jest.fn(),
  listTransactionsForMonth: jest.fn(),
  computeMonthSummary: jest.fn(),
  deleteAllTransactionsForMonth: jest.fn(),
}));

import budgetReducer, {
  resetTxnFilters,
  setTxnGroupBy,
  setTxnSearch,
  setTxnSort,
  setTxnTypeFilter,
} from './budget.slice';
import { selectTxnListGroups } from './budget.selectors';

const txns = [
  {
    id: 'rent',
    date: '2026-08-29',
    amount: 700,
    category: 'needs',
    expenseGroup: 'rent',
    note: 'August rent',
  },
  {
    id: 'coffee',
    date: '2026-08-29',
    amount: 4.5,
    category: 'wants',
    expenseGroup: 'dining',
    note: 'Flat white',
  },
  {
    id: 'groceries',
    date: '2026-08-28',
    amount: 24.5,
    category: 'needs',
    expenseGroup: 'groceries',
    note: 'Lidl',
  },
  {
    id: 'dinner',
    date: '2026-08-27',
    amount: 31,
    category: 'wants',
    expenseGroup: 'dining',
    note: '',
  },
  {
    id: 'invest',
    date: '2026-08-26',
    amount: 120,
    category: 'savings',
    expenseGroup: 'investments',
    note: 'ETF',
  },
];

const baseState = {
  settings: { startDay: 1 },
  budget: {
    month: '2026-08',
    doc: {
      month: '2026-08',
      income: 1000,
      percents: { needs: 50, wants: 30, savings: 20 },
      allocations: { needs: 500, wants: 300, savings: 200 },
      startDay: 1,
      periodStart: '2026-08-01T00:00:00.000Z',
      periodEnd: '2026-09-01T00:00:00.000Z',
      createdAt: null,
      updatedAt: null,
    },
    txns,
    loadStatus: 'ready',
    mutateStatus: 'idle',
    ui: { type: 'all', search: '', groupBy: 'date', sortKey: 'newest' },
  },
};

const stateWithUi = (ui: Partial<typeof baseState.budget.ui>) => ({
  ...baseState,
  budget: {
    ...baseState.budget,
    ui: { ...baseState.budget.ui, ...ui },
  },
});

const groupsFor = (state = baseState) => selectTxnListGroups(state as any) as any[];

const itemIds = (groupIndex: number, state = baseState) =>
  groupsFor(state)[groupIndex].items.map((txn: any) => txn.id);

describe('budget transaction UI state', () => {
  it('defaults to date grouping with newest sort', () => {
    const state = budgetReducer(undefined, { type: '@@INIT' });

    expect(state.ui.groupBy).toBe('date');
    expect(state.ui.sortKey).toBe('newest');
  });

  it('switching groupBy does not overwrite the selected sort', () => {
    const withSort = budgetReducer(undefined, setTxnSort('amountAsc'));
    const next = budgetReducer(withSort, setTxnGroupBy('expenseGroup'));

    expect(next.ui.groupBy).toBe('expenseGroup');
    expect(next.ui.sortKey).toBe('amountAsc');
  });

  it('switching sort does not overwrite the selected groupBy', () => {
    const withGroup = budgetReducer(undefined, setTxnGroupBy('expenseGroup'));
    const next = budgetReducer(withGroup, setTxnSort('oldest'));

    expect(next.ui.groupBy).toBe('expenseGroup');
    expect(next.ui.sortKey).toBe('oldest');
  });
});

describe('budget transaction selectors', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-08-29T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('groups date ledgers newest first by default', () => {
    const groups = groupsFor();

    expect(groups.map((group) => group.kind)).toEqual(['date', 'date', 'date', 'date']);
    expect(groups.map((group) => group.key)).toEqual([
      '2026-08-29',
      '2026-08-28',
      '2026-08-27',
      '2026-08-26',
    ]);
  });

  it('can group date ledgers oldest first', () => {
    const groups = groupsFor(stateWithUi({ sortKey: 'oldest' }));

    expect(groups.map((group) => group.key)).toEqual([
      '2026-08-26',
      '2026-08-27',
      '2026-08-28',
      '2026-08-29',
    ]);
  });

  it('sorts amount high to low inside each date group', () => {
    expect(itemIds(0, stateWithUi({ sortKey: 'amountDesc' }))).toEqual(['rent', 'coffee']);
  });

  it('sorts amount low to high inside each date group', () => {
    expect(itemIds(0, stateWithUi({ sortKey: 'amountAsc' }))).toEqual(['coffee', 'rent']);
  });

  it('creates expense-group ledgers ordered by highest total spend', () => {
    const groups = groupsFor(stateWithUi({ groupBy: 'expenseGroup' }));

    expect(groups.map((group) => group.kind)).toEqual([
      'expenseGroup',
      'expenseGroup',
      'expenseGroup',
      'expenseGroup',
    ]);
    expect(groups.map((group) => group.key)).toEqual(['rent', 'investments', 'dining', 'groceries']);
    expect(groups.map((group) => group.total)).toEqual([700, 120, 35.5, 24.5]);
  });

  it('sorts expense-group rows newest first', () => {
    const groups = groupsFor(stateWithUi({ groupBy: 'expenseGroup' }));
    const dining = groups.find((group) => group.key === 'dining');

    expect(dining?.items.map((txn: any) => txn.id)).toEqual(['coffee', 'dinner']);
  });

  it('sorts expense-group rows oldest first', () => {
    const groups = groupsFor(stateWithUi({ groupBy: 'expenseGroup', sortKey: 'oldest' }));
    const dining = groups.find((group) => group.key === 'dining');

    expect(dining?.items.map((txn: any) => txn.id)).toEqual(['dinner', 'coffee']);
  });

  it('sorts expense-group rows by amount high and low', () => {
    const highGroups = groupsFor(stateWithUi({ groupBy: 'expenseGroup', sortKey: 'amountDesc' }));
    const lowGroups = groupsFor(stateWithUi({ groupBy: 'expenseGroup', sortKey: 'amountAsc' }));

    expect(highGroups.find((group) => group.key === 'dining')?.items.map((txn: any) => txn.id)).toEqual([
      'dinner',
      'coffee',
    ]);
    expect(lowGroups.find((group) => group.key === 'dining')?.items.map((txn: any) => txn.id)).toEqual([
      'coffee',
      'dinner',
    ]);
  });

  it('searches selected-period transactions by remembered ledger fields', () => {
    const byAmount = groupsFor(stateWithUi({ search: '24.5' }));
    const byDate = groupsFor(stateWithUi({ search: '2026-08-27' }));
    const byCategory = groupsFor(stateWithUi({ search: 'wants' }));
    const byExpenseGroup = groupsFor(stateWithUi({ search: 'dining' }));

    expect(byAmount.flatMap((group) => group.items.map((txn: any) => txn.id))).toEqual(['groceries']);
    expect(byDate.flatMap((group) => group.items.map((txn: any) => txn.id))).toEqual(['dinner']);
    expect(byCategory.flatMap((group) => group.items.map((txn: any) => txn.id))).toEqual([
      'coffee',
      'dinner',
    ]);
    expect(byExpenseGroup.flatMap((group) => group.items.map((txn: any) => txn.id))).toEqual([
      'coffee',
      'dinner',
    ]);
  });

  it('filters by high-level budget category before grouping', () => {
    const groups = groupsFor(stateWithUi({ type: 'savings' }));

    expect(groups).toHaveLength(1);
    expect(groups[0].items.map((txn: any) => txn.id)).toEqual(['invest']);
  });

  it('resetting transaction UI state returns canonical ledger state', () => {
    const changed = budgetReducer(undefined, setTxnGroupBy('expenseGroup'));
    const searched = budgetReducer(changed, setTxnSearch('coffee'));
    const filtered = budgetReducer(searched, setTxnTypeFilter('wants'));
    const sorted = budgetReducer(filtered, setTxnSort('amountDesc'));
    const reset = budgetReducer(sorted, resetTxnFilters());

    expect(reset.ui).toEqual({ type: 'all', search: '', groupBy: 'date', sortKey: 'newest' });
  });
});
