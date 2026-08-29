import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';

import '../../../i18n/i18n';
import { CaptureFeedbackProvider, useCaptureFeedback } from './capture-feedback-provider.component';

const mockNavigate = jest.fn();
let mockCurrentPath = '/transactions';
let mockCurrentSearch = '';

jest.mock(
  'react-router-dom',
  () => ({
    useLocation: () => ({ pathname: mockCurrentPath, search: mockCurrentSearch }),
    useNavigate: () => mockNavigate,
  }),
  { virtual: true },
);

const Harness: React.FC = () => {
  const { continuationDate, showExpenseAdded } = useCaptureFeedback();

  return (
    <div>
      <p data-testid="continuation-date">{continuationDate ?? 'none'}</p>
      <button
        type="button"
        onClick={() => showExpenseAdded({ date: '2026-08-28', from: '/transactions' })}
      >
        save-first
      </button>
      <button
        type="button"
        onClick={() => showExpenseAdded({ date: '2026-08-29', from: '/transactions' })}
      >
        save-second
      </button>
    </div>
  );
};

const renderFeedback = () =>
  render(
    <CaptureFeedbackProvider>
      <Harness />
    </CaptureFeedbackProvider>,
  );

const revealPendingFeedback = () => {
  act(() => {
    jest.advanceTimersByTime(16);
  });
};

const enterCompactPhase = () => {
  act(() => {
    jest.advanceTimersByTime(900);
  });
};

describe('CaptureFeedbackProvider', () => {
  beforeEach(() => {
    mockCurrentPath = '/transactions';
    mockCurrentSearch = '';
    mockNavigate.mockClear();
    Object.defineProperty(window, 'requestAnimationFrame', {
      configurable: true,
      value: jest.fn((callback: FrameRequestCallback) =>
        window.setTimeout(() => callback(performance.now()), 16),
      ),
    });
    Object.defineProperty(window, 'cancelAnimationFrame', {
      configurable: true,
      value: jest.fn((handle: number) => window.clearTimeout(handle)),
    });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('waits until the destination route is rendered before showing success feedback', () => {
    mockCurrentPath = '/transactions/new';
    const { rerender } = renderFeedback();

    fireEvent.click(screen.getByText('save-first'));

    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    mockCurrentPath = '/transactions';
    rerender(
      <CaptureFeedbackProvider>
        <Harness />
      </CaptureFeedbackProvider>,
    );
    revealPendingFeedback();

    expect(screen.getByRole('status')).toHaveTextContent('Expense added');
  });

  it('shows singular central success feedback without Add another until compact', () => {
    renderFeedback();

    fireEvent.click(screen.getByText('save-first'));
    revealPendingFeedback();

    expect(screen.getByRole('status')).toHaveTextContent('Expense added');
    expect(screen.queryByRole('button', { name: 'Add another' })).not.toBeInTheDocument();

    enterCompactPhase();

    expect(screen.getByRole('button', { name: 'Add another' })).toBeInTheDocument();
  });

  it('keeps Add another hidden on central reveal even if navigation is delayed', () => {
    mockCurrentPath = '/transactions/new';
    const { rerender } = renderFeedback();

    fireEvent.click(screen.getByText('save-first'));
    act(() => {
      jest.advanceTimersByTime(1200);
    });

    mockCurrentPath = '/transactions';
    rerender(
      <CaptureFeedbackProvider>
        <Harness />
      </CaptureFeedbackProvider>,
    );
    revealPendingFeedback();

    expect(screen.getByRole('status')).toHaveTextContent('Expense added');
    expect(screen.queryByRole('button', { name: 'Add another' })).not.toBeInTheDocument();
  });

  it('reopens Capture and exposes the saved date when compact Add another is selected', () => {
    renderFeedback();

    fireEvent.click(screen.getByText('save-first'));
    revealPendingFeedback();
    enterCompactPhase();
    fireEvent.click(screen.getByRole('button', { name: 'Add another' }));

    expect(mockNavigate).toHaveBeenCalledWith('/transactions/new', {
      state: { from: '/transactions' },
    });
    expect(screen.getByTestId('continuation-date')).toHaveTextContent('2026-08-28');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('increments the session count across continued saves and uses plural copy', () => {
    renderFeedback();

    fireEvent.click(screen.getByText('save-first'));
    revealPendingFeedback();
    enterCompactPhase();
    fireEvent.click(screen.getByRole('button', { name: 'Add another' }));
    fireEvent.click(screen.getByText('save-second'));
    revealPendingFeedback();

    expect(screen.getByRole('status')).toHaveTextContent('2 expenses added');
    expect(screen.getByTestId('continuation-date')).toHaveTextContent('2026-08-29');
  });

  it('ends the session naturally when feedback auto-dismisses', () => {
    renderFeedback();

    fireEvent.click(screen.getByText('save-first'));
    revealPendingFeedback();
    act(() => {
      jest.advanceTimersByTime(6500);
    });

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByTestId('continuation-date')).toHaveTextContent('none');
  });

  it('cleans up feedback on the login route', () => {
    const { rerender } = renderFeedback();

    fireEvent.click(screen.getByText('save-first'));
    revealPendingFeedback();
    mockCurrentPath = '/login';
    rerender(
      <CaptureFeedbackProvider>
        <Harness />
      </CaptureFeedbackProvider>,
    );

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
