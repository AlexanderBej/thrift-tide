import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import '../../../i18n/i18n';
import SortSheet from './sort-sheet.component';

jest.mock('@shared/ui', () => ({
  BaseSheet: ({ open, title, children }: React.PropsWithChildren<{ open: boolean; title: string }>) =>
    open ? (
      <section>
        <h2>{title}</h2>
        {children}
      </section>
    ) : null,
  TTIcon: () => <span aria-hidden="true" />,
}));

describe('SortSheet', () => {
  it('shows independent group and sort selections', () => {
    render(
      <SortSheet
        open
        onOpenChange={jest.fn()}
        groupBy="expenseGroup"
        sortKey="amountAsc"
      />,
    );

    expect(screen.getByRole('heading', { name: 'Organize transactions' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Expense group' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Lowest amount' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('changing groupBy preserves the selected sort', () => {
    const onOpenChange = jest.fn();

    render(
      <SortSheet open onOpenChange={onOpenChange} groupBy="date" sortKey="amountDesc" />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Expense group' }));

    expect(onOpenChange).toHaveBeenCalledWith(false, 'expenseGroup', 'amountDesc');
  });

  it('changing sort preserves the selected groupBy', () => {
    const onOpenChange = jest.fn();

    render(
      <SortSheet open onOpenChange={onOpenChange} groupBy="expenseGroup" sortKey="newest" />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Oldest first' }));

    expect(onOpenChange).toHaveBeenCalledWith(false, 'expenseGroup', 'oldest');
  });
});
