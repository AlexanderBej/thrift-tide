import React from 'react';
import { render, screen } from '@testing-library/react';

import '../../i18n/i18n';
import CategoriesPage from './categories.component';

const mockSelectBudgetDoc = jest.fn();
const mockSelectCards = jest.fn();
const mockSelectBudgetContextSemantics = jest.fn();

jest.mock('react-redux', () => ({
  useSelector: (selector: () => unknown) => selector(),
}));

jest.mock(
  'react-router-dom',
  () => ({
    NavLink: ({
      children,
      to,
      ...props
    }: React.PropsWithChildren<{ to: string; [key: string]: unknown }>) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  }),
  { virtual: true },
);

jest.mock('@store/budget-store', () => ({
  selectBudgetDoc: () => mockSelectBudgetDoc(),
  selectCards: () => mockSelectCards(),
  selectBudgetContextSemantics: () => mockSelectBudgetContextSemantics(),
}));

jest.mock('@shared/hooks', () => ({
  useFormatMoney: () => (value: number) => `€${value.toFixed(2)}`,
}));

jest.mock('@shared/components', () => ({
  ExpenseGroupIcon: () => <span data-testid="expense-group-icon" aria-hidden="true" />,
}));

jest.mock('@shared/ui', () => ({
  TTIcon: () => <span aria-hidden="true" />,
}));

const cards = [
  { key: 'needs', title: 'Needs', allocated: 1200, spent: 269.6, remaining: 930.4, progress: 0.22 },
  { key: 'wants', title: 'Wants', allocated: 720, spent: 798.5, remaining: 0, progress: 1 },
  { key: 'savings', title: 'Savings', allocated: 480, spent: 500, remaining: 0, progress: 1 },
];

const pulseRows = [
  { key: 'needs', amount: 930.4, amountState: 'left', progress: 0.22, percent: 22, tone: 'muted' },
  { key: 'wants', amount: 78.5, amountState: 'over', progress: 1, percent: 111, tone: 'danger' },
  {
    key: 'savings',
    amount: 20,
    amountState: 'aboveGoal',
    progress: 1,
    percent: 104,
    tone: 'success',
  },
];

const hasExactText = (text: string) => (_: string, element: Element | null) =>
  element?.textContent === text;

function renderCategories() {
  return render(<CategoriesPage />);
}

describe('CategoriesPage V3 overview', () => {
  beforeEach(() => {
    mockSelectBudgetDoc.mockReturnValue({
      income: 2400,
      percents: { needs: 0.5, wants: 0.3, savings: 0.2 },
    });
    mockSelectCards.mockReturnValue(cards);
    mockSelectBudgetContextSemantics.mockReturnValue({
      periodPhase: 'current',
      pulseRows,
    });
  });

  it('renders the selected-period budget map summary and allocation split', () => {
    renderCategories();

    expect(screen.getByRole('heading', { name: '€2400.00' })).toBeInTheDocument();
    expect(screen.getByText('planned')).toBeInTheDocument();
    expect(screen.getAllByText('50%').length).toBeGreaterThan(0);
    expect(screen.getAllByText('30%').length).toBeGreaterThan(0);
    expect(screen.getAllByText('20%').length).toBeGreaterThan(0);
    expect(
      screen.getByRole('img', {
        name: 'Allocation split: Needs 50%, Wants 30%, Savings 20%.',
      }),
    ).toBeInTheDocument();
  });

  it('renders category-appropriate current-period status copy', () => {
    renderCategories();

    expect(
      screen.getAllByText(hasExactText('€269.60 spent · €930.40 left')).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText(hasExactText('€798.50 spent · €78.50 over')).length).toBeGreaterThan(
      0,
    );
    expect(
      screen.getAllByText(hasExactText('€500.00 contributed · €20.00 above goal')).length,
    ).toBeGreaterThan(0);
  });

  it('uses historical unused copy without active-period judgment language', () => {
    mockSelectBudgetContextSemantics.mockReturnValue({
      periodPhase: 'past',
      pulseRows,
    });

    renderCategories();

    expect(
      screen.getAllByText(hasExactText('€269.60 spent · €930.40 unused')).length,
    ).toBeGreaterThan(0);
    expect(screen.queryByText(/on track/i)).not.toBeInTheDocument();
  });

  it('keeps future periods as planning maps', () => {
    mockSelectBudgetContextSemantics.mockReturnValue({
      periodPhase: 'future',
      pulseRows,
    });

    renderCategories();

    expect(screen.getAllByText(hasExactText('€1200.00 allocated')).length).toBeGreaterThan(0);
    expect(screen.queryByText(/healthy/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/under plan/i)).not.toBeInTheDocument();
  });

  it('avoids meaningless zero health cards when there is no income', () => {
    mockSelectBudgetDoc.mockReturnValue({
      income: 0,
      percents: { needs: 0.5, wants: 0.3, savings: 0.2 },
    });

    renderCategories();

    expect(screen.getByRole('heading', { name: 'Not set yet' })).toBeInTheDocument();
    expect(screen.getAllByText('Structure preview for this category')).toHaveLength(3);
    expect(screen.queryByText(/€0.00 left/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/€0.00 allocated/i)).not.toBeInTheDocument();
    expect(screen.getAllByText('planned share')).toHaveLength(3);
  });

  it('previews the first three taxonomy groups and remaining count for each category', () => {
    renderCategories();

    expect(screen.getByText('Rent / Mortgage')).toBeInTheDocument();
    expect(screen.getByText('Utilities')).toBeInTheDocument();
    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.getAllByText('+4')).toHaveLength(3);
  });

  it('links each whole card into the existing category detail route', () => {
    renderCategories();

    expect(screen.getByRole('link', { name: /open needs/i })).toHaveAttribute(
      'href',
      '/categories/needs',
    );
    expect(screen.getByRole('link', { name: /open wants/i })).toHaveAttribute(
      'href',
      '/categories/wants',
    );
    expect(screen.getByRole('link', { name: /open savings/i })).toHaveAttribute(
      'href',
      '/categories/savings',
    );
  });
});
