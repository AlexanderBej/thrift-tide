import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import '../../i18n/i18n';
import Insights from './insights.component';
import { buildInsightsAnalytics, InsightsAnalytics, UsableInsightPeriod } from './insights-analytics.util';

const mockDispatch = jest.fn((action) => action);
const mockLoadInsightsHistory = jest.fn((payload) => ({ type: 'insights/loadHistory', payload }));

let mockUser: { uuid: string } | null = { uuid: 'user-1' };
let mockStatus: 'idle' | 'loading' | 'ready' | 'error' = 'ready';
let mockError: string | undefined;
let mockAnalytics: InsightsAnalytics = buildInsightsAnalytics([]);
let mockInsightsUid: string | null = 'user-1';

jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector: (state?: unknown) => unknown) =>
    selector({ insights: { uid: mockInsightsUid } }),
}));

jest.mock('@store/auth-store', () => ({
  selectAuthUser: () => mockUser,
}));

jest.mock('@store/insights-store', () => ({
  loadInsightsHistory: (payload: unknown) => mockLoadInsightsHistory(payload),
  selectInsightsAnalytics: () => mockAnalytics,
  selectInsightsError: () => mockError,
  selectInsightsStatus: () => mockStatus,
  selectInsightsUid: (state: { insights?: { uid?: string | null } }) => state.insights?.uid ?? null,
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
  TTIcon: () => <span data-testid="tt-icon" />,
}));

const makePeriod = (
  month: string,
  totalSpent: number,
  overrides: Partial<UsableInsightPeriod['summary']> = {},
): UsableInsightPeriod => ({
  id: month,
  month,
  income: 2400,
  percents: { needs: 0.5, wants: 0.3, savings: 0.2 },
  allocations: { needs: 1200, wants: 720, savings: 480 },
  startDay: 25,
  periodStart: `${month}-01T00:00:00.000Z`,
  periodEnd: `${month}-28T00:00:00.000Z`,
  createdAt: null,
  updatedAt: null,
  summary: {
    totalSpent,
    spent: { needs: totalSpent * 0.45, wants: totalSpent * 0.3, savings: 480 },
    totalTxns: 20,
    income: 2400,
    allocations: { needs: 1200, wants: 720, savings: 480 },
    computedAt: `${month}-28T01:00:00.000Z`,
    ...overrides,
  },
});

const setPeriods = (periods: UsableInsightPeriod[]) => {
  mockAnalytics = buildInsightsAnalytics(periods, new Date('2026-08-31T12:00:00.000Z'));
};

describe('Insights V3 page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = { uuid: 'user-1' };
    mockStatus = 'ready';
    mockError = undefined;
    mockInsightsUid = 'user-1';
    setPeriods([]);
  });

  it('loads analytical history independently when idle', () => {
    mockStatus = 'idle';

    render(<Insights />);

    expect(mockLoadInsightsHistory).toHaveBeenCalledWith({ uid: 'user-1' });
  });

  it('renders loading and recoverable error states', () => {
    mockStatus = 'loading';
    const { rerender } = render(<Insights />);

    expect(screen.getByText('Loading insights...')).toBeInTheDocument();
    expect(screen.getByTestId('local-spinner')).toBeInTheDocument();

    mockStatus = 'error';
    mockError = undefined;
    rerender(<Insights />);

    expect(screen.getByText("Couldn't load insights")).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(mockLoadInsightsHistory).toHaveBeenCalledWith({ uid: 'user-1' });
  });

  it('renders the intentional empty state for no usable summaries', () => {
    render(<Insights />);

    expect(screen.getByText('Insights will grow with your history')).toBeInTheDocument();
    expect(screen.queryByText('Closed-period spending')).not.toBeInTheDocument();
  });

  it('does not make trend claims for one usable period', () => {
    setPeriods([makePeriod('2026-07', 1200)]);

    render(<Insights />);

    expect(screen.getByText('Last 1 closed periods')).toBeInTheDocument();
    expect(screen.getByText('One period is ready')).toBeInTheDocument();
    expect(screen.getByText('Your first closed period is ready')).toBeInTheDocument();
    expect(screen.queryByText('Closed-period spending')).not.toBeInTheDocument();
  });

  it('renders partial 2-5 period analysis with honest window labels', () => {
    setPeriods([makePeriod('2026-05', 1300), makePeriod('2026-06', 1100), makePeriod('2026-07', 900)]);

    render(<Insights />);

    expect(screen.getByText('Last 3 closed periods')).toBeInTheDocument();
    expect(screen.getByText('Closed-period spending')).toBeInTheDocument();
    expect(screen.getByText('How periods finished')).toBeInTheDocument();
    expect(screen.getByText('Needs, Wants, Savings')).toBeInTheDocument();
    expect(screen.getByText('Goal follow-through')).toBeInTheDocument();
    expect(screen.getByText('Pattern to watch')).toBeInTheDocument();
  });

  it('renders full six-period comparison without a fake budget reference line', () => {
    setPeriods([
      makePeriod('2026-02', 2000, { income: 2500 }),
      makePeriod('2026-03', 2000, { income: 2200 }),
      makePeriod('2026-04', 2000, { income: 2100 }),
      makePeriod('2026-05', 1800, { income: 2400 }),
      makePeriod('2026-06', 1800, { income: 2300 }),
      makePeriod('2026-07', 1800, { income: 2600 }),
    ]);

    render(<Insights />);

    expect(screen.getByText('Last 6 closed periods')).toBeInTheDocument();
    expect(screen.getByText('Spending is down 10%')).toBeInTheDocument();
    expect(screen.getByText('down 10% vs previous 3 periods')).toBeInTheDocument();
    expect(screen.queryByText(/Recent average spent:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Budget$/)).not.toBeInTheDocument();
  });

  it('uses compact chart labels while exact spending values remain available', () => {
    setPeriods([makePeriod('2026-06', 1879), makePeriod('2026-07', 598)]);

    render(<Insights />);

    expect(screen.getByText('€1.88k')).toBeInTheDocument();
    expect(screen.getByText('€598')).toBeInTheDocument();
    expect(screen.getByLabelText('Jun: €1879.00 spent')).toBeInTheDocument();
    expect(screen.getByTitle('€1879.00')).toBeInTheDocument();
  });

  it('renders tracked-period budget outcomes without counting empty budgeted periods', () => {
    setPeriods([
      makePeriod('2026-05', 0, { income: 2400, totalTxns: 0 }),
      makePeriod('2026-06', 1800, { income: 2400, totalTxns: 10 }),
      makePeriod('2026-07', 2600, { income: 2400, totalTxns: 10 }),
    ]);

    render(<Insights />);

    expect(screen.getByText('You stayed under or on budget in 1 of 2 tracked periods.')).toBeInTheDocument();
    expect(screen.getByText('1 of 2')).toBeInTheDocument();
    expect(screen.getByText('€600.00 unused')).toBeInTheDocument();
  });

  it('renders insufficient budget outcomes when only empty budgeted periods exist', () => {
    setPeriods([makePeriod('2026-06', 0, { totalTxns: 0 }), makePeriod('2026-07', 0, { totalTxns: 0 })]);

    render(<Insights />);

    expect(
      screen.getByText('Budget outcomes need tracked closed periods with spending activity and a positive saved income.'),
    ).toBeInTheDocument();
  });

  it('applies semantic category sparkline and latest-value classes', () => {
    const periods = [
      makePeriod('2026-06', 900, {
        spent: { needs: 90, wants: 80, savings: 80 },
        allocations: { needs: 100, wants: 100, savings: 100 },
      }),
      makePeriod('2026-07', 900, {
        spent: { needs: 108, wants: 125, savings: 120 },
        allocations: { needs: 100, wants: 100, savings: 100 },
      }),
    ];
    setPeriods(periods);

    const { container } = render(<Insights />);

    expect(container.querySelector('.category-sparkline--needs')).toBeInTheDocument();
    expect(container.querySelector('.category-sparkline--wants')).toBeInTheDocument();
    expect(container.querySelector('.category-sparkline--savings')).toBeInTheDocument();
    expect(container.querySelector('.category-pattern__metric--warning')?.textContent).toContain('108%');
    expect(container.querySelector('.category-pattern__metric--danger')?.textContent).toContain('125%');
    expect(container.querySelector('.category-pattern__metric--success')?.textContent).toContain('120%');
  });

  it('renders reached, missed, and unavailable savings sequence dots distinctly', () => {
    setPeriods([
      makePeriod('2026-05', 900, {
        spent: { needs: 0, wants: 0, savings: 80 },
        allocations: { needs: 1, wants: 1, savings: 100 },
      }),
      makePeriod('2026-06', 900, {
        spent: { needs: 0, wants: 0, savings: 120 },
        allocations: { needs: 1, wants: 1, savings: 100 },
      }),
      makePeriod('2026-07', 900, {
        allocations: { needs: 1, wants: 1, savings: 0 },
      }),
    ]);

    const { container } = render(<Insights />);

    expect(container.querySelector('.savings-sequence__dot--missed')).toBeInTheDocument();
    expect(container.querySelector('.savings-sequence__dot--reached')).toBeInTheDocument();
    expect(container.querySelector('.savings-sequence__dot--unavailable')).toBeInTheDocument();
  });

  it('renders volatile watch copy as a min-to-max range', () => {
    mockAnalytics = {
      ...buildInsightsAnalytics([makePeriod('2026-06', 900), makePeriod('2026-07', 900)]),
      watch: {
        kind: 'categoryVolatile',
        category: 'needs',
        fromPercent: 0,
        toPercent: 1.12,
        rangePercent: 1.12,
      },
    };

    render(<Insights />);

    expect(screen.getByText('Usage ranged from 0% to 112% across your recent periods.')).toBeInTheDocument();
  });

  it('renders Romanian dynamic labels', () => {
    const i18n = require('../../i18n/i18n').default;
    i18n.changeLanguage('ro');
    setPeriods([makePeriod('2026-06', 1100), makePeriod('2026-07', 900)]);

    const { unmount } = render(<Insights />);

    expect(screen.getByText('Ultimele 2 perioade închise')).toBeInTheDocument();
    expect(screen.getByText('Cheltuieli pe perioade închise')).toBeInTheDocument();

    unmount();
    i18n.changeLanguage('en');
  });
});
