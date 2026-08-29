import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import '../../i18n/i18n';
import Transactions from './transactions.component';

const mockDispatch = jest.fn();
const mockNavigate = jest.fn();
const mockDeleteTxnFromMonthThunk = jest.fn();

let mockGroups = [
  {
    key: '2026-08-29',
    label: '2026-08-29',
    kind: 'date',
    total: 34,
    items: [
      {
        id: 'txn-1',
        amount: 12,
        category: 'wants',
        expenseGroup: 'shopping',
        note: 'New shirt',
        date: '2026-08-29',
      },
      {
        id: 'txn-2',
        amount: 22,
        category: 'wants',
        expenseGroup: 'dining',
        note: 'Lunch',
        date: '2026-08-29',
      },
    ],
  },
];

const getMockTxnsInPeriod = () => mockGroups.flatMap((group) => group.items);

jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector: () => unknown) => selector(),
}));

jest.mock(
  'react-router-dom',
  () => ({
    useLocation: () => ({ pathname: '/transactions' }),
    useNavigate: () => mockNavigate,
  }),
  { virtual: true },
);

jest.mock('@store/budget-store', () => ({
  selectTxnListGroups: () => mockGroups,
  selectBudgetMonth: () => '2026-08',
  selectTxnsInPeriod: () => getMockTxnsInPeriod(),
  selectBudgetContextSemantics: () => ({
    periodPhase: 'current',
    periodStart: new Date(2026, 7, 1),
    periodLastDay: new Date(2026, 7, 31),
  }),
  selectBudgetLoadStatus: () => 'ready',
  selectTxnUi: () => ({ type: 'all', search: '', groupBy: 'date', sortKey: 'newest' }),
  deleteTxnFromMonthThunk: (...args: unknown[]) => mockDeleteTxnFromMonthThunk(...args),
  setTxnGroupBy: (value: string) => ({ type: 'budget/setTxnGroupBy', payload: value }),
  setTxnTypeFilter: (value: string) => ({ type: 'budget/setTxnTypeFilter', payload: value }),
  setTxnSearch: (value: string) => ({ type: 'budget/setTxnSearch', payload: value }),
  setTxnSort: (value: string) => ({ type: 'budget/setTxnSort', payload: value }),
}));

jest.mock('@store/auth-store/auth.selectors', () => ({
  selectAuthUserId: () => 'user-1',
}));

jest.mock('@shared/hooks', () => ({
  useFormatMoney: (showCurrency = true) => (value: number) =>
    showCurrency ? `€${value.toFixed(2)}` : value.toFixed(2),
}));

jest.mock('@shared/ui', () => ({
  InfoBlock: ({ children, className }: React.PropsWithChildren<{ className?: string }>) => (
    <div className={className}>{children}</div>
  ),
  Input: ({ prefixIcon: _prefixIcon, ...props }: any) => <input {...props} />,
  PageSpinner: () => <div>Loading</div>,
  TTIcon: () => <span aria-hidden="true" />,
}));

jest.mock('@shared/components/expense-group/expense-group-icon', () => ({
  ExpenseGroupIcon: () => <span aria-hidden="true" />,
}));

jest.mock('features', () => ({
  TransactionLine: ({ txn }: { txn: { note: string; amount: number } }) => (
    <div>
      <span>{txn.note}</span>
      <span>-{txn.amount.toFixed(2)}</span>
    </div>
  ),
}));

jest.mock('@widgets', () => ({
  SortSheet: () => null,
  ConfirmSheet: ({
    open,
    title,
    btnLabel,
    onConfirm,
  }: {
    open: boolean;
    title: string;
    btnLabel: string;
    onConfirm: () => void;
  }) =>
    open ? (
      <section>
        <h2>{title}</h2>
        <button type="button" onClick={onConfirm}>
          {btnLabel}
        </button>
      </section>
    ) : null,
}));

describe('Transactions', () => {
  beforeEach(() => {
    mockGroups = [
      {
        key: '2026-08-29',
        label: '2026-08-29',
        kind: 'date',
        total: 34,
        items: [
          {
            id: 'txn-1',
            amount: 12,
            category: 'wants',
            expenseGroup: 'shopping',
            note: 'New shirt',
            date: '2026-08-29',
          },
          {
            id: 'txn-2',
            amount: 22,
            category: 'wants',
            expenseGroup: 'dining',
            note: 'Lunch',
            date: '2026-08-29',
          },
        ],
      },
    ];
    mockDispatch.mockReset();
    mockNavigate.mockReset();
    mockDeleteTxnFromMonthThunk.mockReset();
    mockDispatch.mockReturnValue({ unwrap: jest.fn().mockResolvedValue(undefined) });
    mockDeleteTxnFromMonthThunk.mockImplementation((payload) => ({
      type: 'budget/deleteTxnFromMonth',
      payload,
    }));
  });

  it('tapping a closed row expands its inline actions', () => {
    render(<Transactions />);

    const row = screen.getByRole('button', { name: /manage new shirt/i });
    fireEvent.click(row);

    expect(row).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Edit New shirt' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete New shirt' })).toBeInTheDocument();
  });

  it('tapping the same open row collapses it', () => {
    render(<Transactions />);

    const row = screen.getByRole('button', { name: /manage new shirt/i });
    fireEvent.click(row);
    fireEvent.click(row);

    expect(row).toHaveAttribute('aria-expanded', 'false');
  });

  it('opening a second row closes the first', () => {
    render(<Transactions />);

    const first = screen.getByRole('button', { name: /manage new shirt/i });
    const second = screen.getByRole('button', { name: /manage lunch/i });
    fireEvent.click(first);
    fireEvent.click(second);

    expect(first).toHaveAttribute('aria-expanded', 'false');
    expect(second).toHaveAttribute('aria-expanded', 'true');
  });

  it('clears an expanded row when it is no longer visible', async () => {
    const { rerender } = render(<Transactions />);

    const row = screen.getByRole('button', { name: /manage new shirt/i });
    fireEvent.click(row);
    expect(row).toHaveAttribute('aria-expanded', 'true');

    mockGroups = [
      {
        ...mockGroups[0],
        total: 22,
        items: [mockGroups[0].items[1]],
      },
    ];
    rerender(<Transactions />);

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /manage new shirt/i })).not.toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /manage lunch/i })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('Edit action navigates to the Capture edit route without toggling the row', () => {
    render(<Transactions />);

    const row = screen.getByRole('button', { name: /manage new shirt/i });
    fireEvent.click(row);
    fireEvent.click(screen.getByRole('button', { name: 'Edit New shirt' }));

    expect(row).toHaveAttribute('aria-expanded', 'true');
    expect(mockNavigate).toHaveBeenCalledWith('/transactions/2026-08/txn-1/edit', {
      state: { from: '/transactions' },
    });
  });

  it('Delete action opens confirmation without toggling the row', () => {
    render(<Transactions />);

    const row = screen.getByRole('button', { name: /manage new shirt/i });
    fireEvent.click(row);
    fireEvent.click(screen.getByRole('button', { name: 'Delete New shirt' }));

    expect(row).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('heading', { name: "You're removing a transaction" })).toBeInTheDocument();
  });

  it('confirmed Delete calls the selected-month deletion thunk and clears expansion', async () => {
    render(<Transactions />);

    const row = screen.getByRole('button', { name: /manage new shirt/i });
    fireEvent.click(row);
    fireEvent.click(screen.getByRole('button', { name: 'Delete New shirt' }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete transaction' }));

    await waitFor(() => {
      expect(mockDeleteTxnFromMonthThunk).toHaveBeenCalledWith({
        uid: 'user-1',
        month: '2026-08',
        id: 'txn-1',
      });
    });
    await waitFor(() => {
      expect(row).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('does not render legacy SwipeRow controls', () => {
    render(<Transactions />);

    expect(screen.queryByText(/swipe/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/swipe/i)).not.toBeInTheDocument();
  });
});
