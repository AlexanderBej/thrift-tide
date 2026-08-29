import React from 'react';
import { render, screen } from '@testing-library/react';

import '../../../i18n/i18n';
import TransactionLine from './transaction-line.component';
import { resolveExpenseGroup } from '@shared/utils/expense-group-options.util';

jest.mock('react-redux', () => ({
  useSelector: () => 'dark',
}));

jest.mock('@shared/hooks', () => ({
  useFormatMoney: () => (value: number) => value.toFixed(2),
}));

jest.mock('@shared/ui', () => ({
  TTIcon: () => <span aria-hidden="true" />,
}));

describe('TransactionLine', () => {
  it('uses the note as the primary date-group row text and group as secondary text', () => {
    render(
      <TransactionLine
        txn={{
          id: 'txn-1',
          amount: 12,
          category: 'wants',
          expenseGroup: 'shopping',
          note: 'New shirt',
          date: '2026-08-29',
        }}
        expenseGroup={resolveExpenseGroup('shopping')}
      />,
    );

    expect(screen.getByText('New shirt')).toBeInTheDocument();
    expect(screen.getByText('Shopping')).toBeInTheDocument();
    expect(screen.getByText('-12.00')).toBeInTheDocument();
  });

  it('uses note as primary and date as secondary in expense-group rows', () => {
    render(
      <TransactionLine
        variant="expenseGroup"
        txn={{
          id: 'txn-1',
          amount: 31,
          category: 'wants',
          expenseGroup: 'dining',
          note: 'Dinner',
          date: '2026-08-27',
        }}
        expenseGroup={resolveExpenseGroup('dining')}
      />,
    );

    expect(screen.getByText('Dinner')).toBeInTheDocument();
    expect(screen.getByText('Thu, Aug 27')).toBeInTheDocument();
    expect(screen.queryByText('Dining out')).not.toBeInTheDocument();
    expect(screen.getByText('-31.00')).toBeInTheDocument();
  });

  it('uses a muted no-note placeholder in expense-group rows without a note', () => {
    render(
      <TransactionLine
        variant="expenseGroup"
        txn={{
          id: 'txn-1',
          amount: 31,
          category: 'wants',
          expenseGroup: 'dining',
          note: '',
          date: '2026-08-27',
        }}
        expenseGroup={resolveExpenseGroup('dining')}
      />,
    );

    expect(screen.getByText('(no note)')).toBeInTheDocument();
    expect(screen.getByText('Thu, Aug 27')).toBeInTheDocument();
    expect(screen.queryByText('Dining out')).not.toBeInTheDocument();
    expect(screen.getByText('-31.00')).toBeInTheDocument();
  });
});
