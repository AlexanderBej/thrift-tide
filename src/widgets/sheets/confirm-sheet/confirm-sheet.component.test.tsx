import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import ConfirmSheet from './confirm-sheet.component';

jest.mock('@shared/ui/base-sheet', () => ({
  BaseSheet: ({
    open,
    title,
    description,
    children,
  }: React.PropsWithChildren<{ open: boolean; title: string; description?: string }>) =>
    open ? (
      <section aria-label={title} aria-description={description}>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
        {children}
      </section>
    ) : null,
}));

jest.mock('@shared/ui/icon', () => ({
  TTIcon: () => <span aria-hidden="true" />,
}));

jest.mock('@shared/ui/v3-action', () => ({
  V3Action: ({
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
      {loading ? 'Loading' : children}
    </button>
  ),
}));

describe('ConfirmSheet', () => {
  it('renders destructive confirmation with specific labels', () => {
    render(
      <ConfirmSheet
        open
        tone="destructive"
        title="Delete expense"
        description="This transaction will be permanently removed."
        cancelLabel="Cancel"
        confirmLabel="Delete"
        onOpenChange={jest.fn()}
        onConfirm={jest.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Delete expense' })).toBeInTheDocument();
    expect(screen.getByText('This transaction will be permanently removed.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('cancel closes without confirming', () => {
    const onOpenChange = jest.fn();
    const onConfirm = jest.fn();

    render(
      <ConfirmSheet
        open
        title="Discard changes"
        description="Your unsaved changes will be lost."
        cancelLabel="Keep editing"
        confirmLabel="Discard"
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('confirm performs the action', async () => {
    const onConfirm = jest.fn();

    render(
      <ConfirmSheet
        open
        title="Delete expense"
        description="This transaction will be permanently removed."
        cancelLabel="Cancel"
        confirmLabel="Delete"
        onOpenChange={jest.fn()}
        onConfirm={onConfirm}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    });

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('async confirm disables the confirm action and prevents double submit', async () => {
    let resolveConfirm: () => void = () => undefined;
    const onConfirm = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveConfirm = resolve;
        }),
    );

    render(
      <ConfirmSheet
        open
        title="Delete expense"
        description="This transaction will be permanently removed."
        cancelLabel="Cancel"
        confirmLabel="Delete"
        onOpenChange={jest.fn()}
        onConfirm={onConfirm}
      />,
    );

    const confirm = screen.getByRole('button', { name: 'Delete' });
    fireEvent.click(confirm);

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Loading' })).toHaveAttribute('aria-busy', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Loading' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveConfirm();
    });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Delete' })).toBeEnabled());
  });
});
