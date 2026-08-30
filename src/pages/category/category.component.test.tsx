import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import '../../i18n/i18n';
import CategoryPage from './category.component';

const mockDispatch = jest.fn();
const mockNavigate = jest.fn();
const mockSelectBudgetLoadStatus = jest.fn();
const mockSelectBudgetDoc = jest.fn();
const mockSelectBudgetContextSemantics = jest.fn();
const mockMakeSelectExpenseGroupView = jest.fn();
const mockExpenseGroupView = jest.fn();
let mockRouteType: string | undefined = 'needs';

jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector: () => unknown) => selector(),
}));

jest.mock(
  'react-router-dom',
  () => ({
    useParams: () => ({ type: mockRouteType }),
    useNavigate: () => mockNavigate,
    Navigate: ({ to }: { to: string }) => <div data-testid="redirect" data-to={to} />,
  }),
  { virtual: true },
);

jest.mock('@store/budget-store', () => ({
  selectBudgetLoadStatus: () => mockSelectBudgetLoadStatus(),
  selectBudgetDoc: () => mockSelectBudgetDoc(),
  selectBudgetContextSemantics: () => mockSelectBudgetContextSemantics(),
  makeSelectExpenseGroupView: (category: string) => {
    mockMakeSelectExpenseGroupView(category);
    return () => mockExpenseGroupView();
  },
  setTxnTypeFilter: (value: string) => ({ type: 'budget/setTxnTypeFilter', payload: value }),
  setTxnSearch: (value: string) => ({ type: 'budget/setTxnSearch', payload: value }),
}));

jest.mock('@shared/hooks', () => ({
  useFormatMoney: () => (value: number) => `€${value.toFixed(2)}`,
}));

jest.mock('@shared/ui', () => ({
  PageSpinner: () => <div>Loading</div>,
  TTIcon: () => <span aria-hidden="true" />,
}));

jest.mock('@shared/components', () => ({
  ExpenseGroupIcon: () => <span data-testid="expense-group-icon" aria-hidden="true" />,
}));

const basePulseRows = [
  { key: 'needs', amount: 930.4, amountState: 'left', progress: 0.22, percent: 22, tone: 'muted' },
  { key: 'wants', amount: 78.5, amountState: 'over', progress: 1, percent: 111, tone: 'danger' },
  { key: 'savings', amount: 20, amountState: 'aboveGoal', progress: 1, percent: 104, tone: 'success' },
];

function renderCategory() {
  return render(<CategoryPage />);
}

describe('CategoryPage V3 detail', () => {
  beforeEach(() => {
    mockRouteType = 'needs';
    mockDispatch.mockClear();
    mockNavigate.mockClear();
    mockMakeSelectExpenseGroupView.mockClear();
    mockSelectBudgetLoadStatus.mockReturnValue('ready');
    mockSelectBudgetDoc.mockReturnValue({
      income: 2400,
      percents: { needs: 0.5, wants: 0.3, savings: 0.2 },
    });
    mockSelectBudgetContextSemantics.mockReturnValue({
      periodPhase: 'current',
      pulseRows: basePulseRows,
    });
    mockExpenseGroupView.mockReturnValue({
      allocated: 1200,
      spent: 269.6,
      remaining: 930.4,
      progress: 0.22,
      items: [],
      byExpGroup: [
        { expGroup: 'rent', total: 22.6 },
        { expGroup: 'utilities', total: 9.5 },
        { expGroup: 'groceries', total: 237.5 },
      ],
    });
  });

  it.each(['needs', 'wants', 'savings'])('allows /categories/%s without redirecting', (category) => {
    mockRouteType = category;

    renderCategory();

    expect(screen.queryByTestId('redirect')).not.toBeInTheDocument();
    expect(mockMakeSelectExpenseGroupView).toHaveBeenCalledWith(category);
  });

  it('redirects invalid category params before creating category selectors', () => {
    mockRouteType = 'foo';

    renderCategory();

    expect(screen.getByTestId('redirect')).toHaveAttribute('data-to', '/categories');
    expect(mockMakeSelectExpenseGroupView).not.toHaveBeenCalled();
  });

  it('renders the compact category summary and all expense groups', () => {
    renderCategory();

    expect(screen.getByRole('heading', { name: 'Needs' })).toBeInTheDocument();
    expect(screen.getByText('50% of budget')).toBeInTheDocument();
    expect(screen.getByText('€269.60')).toBeInTheDocument();
    expect(screen.getByText('spent')).toBeInTheDocument();
    expect(screen.getByText('€930.40 left of €1200.00')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(7);
  });

  it('orders active groups first by total and zero groups by taxonomy order', () => {
    renderCategory();

    const rows = screen.getAllByRole('listitem');
    expect(rows[0]).toHaveTextContent('Groceries');
    expect(rows[0]).toHaveTextContent('88% of Needs spending');
    expect(rows[1]).toHaveTextContent('Rent / Mortgage');
    expect(rows[2]).toHaveTextContent('Utilities');
    expect(rows[3]).toHaveTextContent('Transport');
    expect(rows[3]).not.toHaveTextContent('0% of Needs spending');
  });

  it('uses savings contribution and above-goal language', () => {
    mockRouteType = 'savings';
    mockExpenseGroupView.mockReturnValue({
      allocated: 480,
      spent: 500,
      remaining: 0,
      progress: 1,
      items: [],
      byExpGroup: [
        { expGroup: 'emergency', total: 300 },
        { expGroup: 'investment', total: 200 },
      ],
    });

    renderCategory();

    expect(screen.getByRole('heading', { name: 'Savings' })).toBeInTheDocument();
    expect(screen.getByText('€500.00')).toBeInTheDocument();
    expect(screen.getByText('contributed')).toBeInTheDocument();
    expect(screen.getByText('€20.00 above goal')).toBeInTheDocument();
    expect(screen.getByText('60% of Savings contributions')).toBeInTheDocument();
  });

  it('renders zero-activity groups without invalid composition percentages', () => {
    mockExpenseGroupView.mockReturnValue({
      allocated: 1200,
      spent: 0,
      remaining: 1200,
      progress: 0,
      items: [],
      byExpGroup: [],
    });

    renderCategory();

    expect(screen.getAllByRole('listitem')).toHaveLength(7);
    expect(screen.queryByText(/NaN|Infinity/)).not.toBeInTheDocument();
    expect(screen.queryByText(/0% of Needs spending/)).not.toBeInTheDocument();
  });

  it('shows a lightweight no-budget state instead of meaningless category health', () => {
    mockSelectBudgetDoc.mockReturnValue({
      income: 0,
      percents: { needs: 0.5, wants: 0.3, savings: 0.2 },
    });
    mockExpenseGroupView.mockReturnValue({
      allocated: 0,
      spent: 0,
      remaining: 0,
      progress: 0,
      items: [],
      byExpGroup: [],
    });

    renderCategory();

    expect(screen.getByText('No budget set for this period.')).toBeInTheDocument();
    expect(screen.queryByText('spent')).not.toBeInTheDocument();
  });

  it('sets the transactions category filter, clears search, and navigates to Transactions', () => {
    renderCategory();

    fireEvent.click(screen.getByRole('button', { name: 'View Needs transactions' }));

    expect(mockDispatch).toHaveBeenCalledWith({ type: 'budget/setTxnTypeFilter', payload: 'needs' });
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'budget/setTxnSearch', payload: '' });
    expect(mockNavigate).toHaveBeenCalledWith('/transactions');
  });
});
