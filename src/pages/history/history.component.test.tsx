import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import '../../i18n/i18n';
import History from './history.component';
import { HistoryArchiveRow } from './history-summary.util';

const mockDispatch = jest.fn((action) => action);
const mockLoadHistoryPage = jest.fn((payload) => ({ type: 'history/loadPage', payload }));
const mockResetHistory = jest.fn(() => ({ type: 'history/resetHistory' }));

let mockUser: { uuid: string } | null = { uuid: 'user-1' };
let mockStatus: 'idle' | 'loading' | 'ready' | 'error' = 'ready';
let mockError: string | undefined;
let mockHasMore = false;
let mockRows: HistoryArchiveRow[] = [];

jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector: () => unknown) => selector(),
}));

jest.mock('@store/auth-store', () => ({
  selectAuthUser: () => mockUser,
}));

jest.mock('@store/history-store', () => ({
  selectHistoryStatus: () => mockStatus,
  selectHistoryHasMore: () => mockHasMore,
  selectHistoryError: () => mockError,
  selectHistoryArchiveRows: () => mockRows,
  resetHistory: () => mockResetHistory(),
  loadHistoryPage: (payload: unknown) => mockLoadHistoryPage(payload),
}));

jest.mock('@shared/hooks', () => ({
  useFormatMoney: () => (value: number) => `€${value.toFixed(2)}`,
}));

jest.mock('@shared/ui', () => ({
  Button: ({
    children,
    disabled,
    loading,
    onClick,
  }: React.PropsWithChildren<{
    disabled?: boolean;
    loading?: boolean;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
  }>) => (
    <button type="button" disabled={disabled || loading} aria-busy={loading || undefined} onClick={onClick}>
      {children}
    </button>
  ),
  LocalSpinner: () => <span data-testid="local-spinner" />,
  TTIcon: () => <span aria-hidden="true" />,
}));

const makeRow = (overrides: Partial<HistoryArchiveRow> = {}): HistoryArchiveRow => ({
  id: '2026-02',
  month: '2026-02',
  income: 2400,
  allocations: { needs: 1200, wants: 720, savings: 480 },
  periodStart: '2026-01-25T00:00:00.000Z',
  periodEnd: '2026-02-25T00:00:00.000Z',
  summary: {
    totalSpent: 1578.1,
    spent: { needs: 264, wants: 806.4, savings: 499.2 },
    totalTxns: 24,
    income: 2400,
    allocations: { needs: 1200, wants: 720, savings: 480 },
    computedAt: '2027-04-10T00:00:00.000Z',
  },
  ...overrides,
});

describe('History', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = { uuid: 'user-1' };
    mockStatus = 'ready';
    mockError = undefined;
    mockHasMore = false;
    mockRows = [makeRow()];
  });

  it('renders compact closed-period cards from historical period metadata', () => {
    render(<History />);

    expect(screen.getByRole('heading', { name: 'February 2026' })).toBeInTheDocument();
    expect(screen.getByText('Jan 25 - Feb 24')).toBeInTheDocument();
    expect(screen.getByText('€821.90 left unused')).toBeInTheDocument();
    expect(screen.getByText('€1578.10 of €2400.00 spent')).toBeInTheDocument();
    expect(screen.getByText('66% used')).toBeInTheDocument();
    expect(screen.getByText('24 transactions')).toBeInTheDocument();
    expect(screen.queryByText('2027')).not.toBeInTheDocument();
  });

  it('renders over-budget, no-spending, no-budget, and missing-summary periods', () => {
    mockRows = [
      makeRow({
        id: 'over',
        summary: {
          ...makeRow().summary!,
          totalSpent: 2474.2,
          spent: { needs: 1200, wants: 874.2, savings: 400 },
        },
      }),
      makeRow({
        id: 'empty',
        month: '2026-01',
        summary: {
          ...makeRow().summary!,
          totalSpent: 0,
          totalTxns: 0,
          spent: { needs: 0, wants: 0, savings: 0 },
        },
      }),
      makeRow({
        id: 'no-budget',
        month: '2025-12',
        income: 0,
        allocations: { needs: 0, wants: 0, savings: 0 },
        summary: {
          ...makeRow().summary!,
          income: 0,
          allocations: { needs: 0, wants: 0, savings: 0 },
          totalSpent: 0,
          totalTxns: 0,
          spent: { needs: 0, wants: 0, savings: 0 },
        },
      }),
      makeRow({ id: 'missing', month: '2025-11', summary: undefined }),
    ];

    render(<History />);

    expect(screen.getByText('€74.20 over budget')).toBeInTheDocument();
    expect(screen.getByText('No expenses recorded')).toBeInTheDocument();
    expect(screen.getByText('No budget set')).toBeInTheDocument();
    expect(screen.getByText('Summary unavailable')).toBeInTheDocument();
    expect(screen.getByText("We couldn't load this period's summary.")).toBeInTheDocument();
  });

  it('keeps zero allocation and Savings above goal safe and visible', () => {
    mockRows = [
      makeRow({
        summary: {
          ...makeRow().summary!,
          spent: { needs: 25, wants: 150, savings: 104 },
          allocations: { needs: 0, wants: 100, savings: 100 },
          totalSpent: 279,
          totalTxns: 1,
        },
      }),
    ];

    render(<History />);

    expect(screen.getByText('Not set')).toBeInTheDocument();
    expect(screen.getByText('150%')).toBeInTheDocument();
    expect(screen.getByText('104%')).toBeInTheDocument();
    expect(screen.queryByText(/Infinity|NaN/)).not.toBeInTheDocument();
  });

  it('renders loading, empty, and error states', () => {
    mockStatus = 'loading';
    mockRows = [];
    const { rerender } = render(<History />);
    expect(screen.getByText('Loading history...')).toBeInTheDocument();
    expect(screen.getByTestId('local-spinner')).toBeInTheDocument();

    mockStatus = 'ready';
    rerender(<History />);
    expect(screen.getByText('No closed periods yet')).toBeInTheDocument();

    mockStatus = 'error';
    mockError = undefined;
    rerender(<History />);
    expect(screen.getByText("Couldn't load history")).toBeInTheDocument();
    expect(screen.getByText('Check your connection and try again.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(mockResetHistory).toHaveBeenCalled();
    expect(mockLoadHistoryPage).toHaveBeenCalledWith({ uid: 'user-1', pageSize: 12 });
  });

  it('renders localized load-more and guards duplicate requests while loading', () => {
    mockHasMore = true;
    mockStatus = 'ready';
    const { rerender } = render(<History />);

    fireEvent.click(screen.getByRole('button', { name: 'Load more' }));
    expect(mockLoadHistoryPage).toHaveBeenCalledWith({ uid: 'user-1', pageSize: 12 });

    mockStatus = 'loading';
    mockRows = [makeRow()];
    rerender(<History />);
    expect(screen.getByRole('button', { name: 'Load more' })).toBeDisabled();
  });

  it('renders Romanian transaction pluralization', () => {
    const i18n = require('../../i18n/i18n').default;
    i18n.changeLanguage('ro');
    mockRows = [makeRow({ summary: { ...makeRow().summary!, totalTxns: 1 } })];

    const { unmount } = render(<History />);

    expect(screen.getByText('1 tranzacție')).toBeInTheDocument();

    unmount();
    i18n.changeLanguage('en');
  });
});
