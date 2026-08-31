import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import '../../i18n/i18n';
import ProfilePage from './profile.component';

const mockDispatch = jest.fn((action) => action);
const mockNavigate = jest.fn();
const mockSignOutUser = jest.fn();
const mockResetCurrentPeriodThunk = jest.fn();
const mockResetUnwrap = jest.fn();

const mockUser = {
  uuid: 'user-1',
  displayName: 'Ada Tide',
  email: 'ada@example.com',
  photoURL: null,
};

const mockSettings = {
  defaultPercents: { needs: 0.5, wants: 0.3, savings: 0.2 },
  startDay: 25,
  language: 'en',
  theme: 'dark',
  currency: 'EUR',
};

const mockBudgetDoc = {
  percents: { needs: 0.6, wants: 0.25, savings: 0.15 },
  startDay: 10,
};

jest.mock(
  'react-router-dom',
  () => ({
    NavLink: ({
      children,
      to,
      className,
    }: React.PropsWithChildren<{ to: string; className?: string }>) => (
      <a href={to} className={className}>
        {children}
      </a>
    ),
    useNavigate: () => mockNavigate,
  }),
  { virtual: true },
);

jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector: () => unknown) => selector(),
}));

jest.mock('@api/services', () => ({
  signOutUser: () => mockSignOutUser(),
}));

jest.mock('@store/auth-store', () => ({
  selectAuthUser: () => mockUser,
}));

jest.mock('@store/settings-store', () => ({
  selectSettingsAll: () => mockSettings,
}));

jest.mock('@store/budget-store', () => ({
  selectBudgetDoc: () => mockBudgetDoc,
  resetCurrentPeriodThunk: (payload: { uid: string }) => mockResetCurrentPeriodThunk(payload),
}));

jest.mock('@shared/components', () => ({
  UserAvatar: () => <div data-testid="user-avatar" />,
}));

jest.mock('@shared/ui', () => {
  return {
    Button: ({
      children,
      loading,
      onClick,
    }: React.PropsWithChildren<{
      loading?: boolean;
      onClick?: React.MouseEventHandler<HTMLButtonElement>;
    }>) => (
      <button type="button" aria-busy={loading || undefined} onClick={onClick}>
        {children}
      </button>
    ),
    Donut: () => <span data-testid="donut" aria-hidden="true" />,
    TTIcon: () => <span aria-hidden="true" />,
  };
});

jest.mock('@widgets', () => ({
  BudgetSplitSheet: ({ open }: { open: boolean }) =>
    open ? <section>Budget split sheet</section> : null,
  ConfirmSheet: ({
    open,
    title,
    description,
    confirmLabel,
    cancelLabel,
    onConfirm,
  }: {
    open: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    cancelLabel: string;
    onConfirm: () => Promise<void>;
  }) =>
    open ? (
      <section>
        <h2>{title}</h2>
        <p>{description}</p>
        <button type="button">{cancelLabel}</button>
        <button type="button" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </section>
    ) : null,
}));

jest.mock('widgets/sheets/language-sheet/language-sheet.component', () => ({
  __esModule: true,
  default: ({ open }: { open: boolean }) => (open ? <section>Language sheet</section> : null),
}));

jest.mock('widgets/sheets/currency-sheet/currency-sheet.component', () => ({
  __esModule: true,
  default: ({ open }: { open: boolean }) => (open ? <section>Currency sheet</section> : null),
}));

jest.mock('widgets/sheets/theme-sheet/theme-sheet.component', () => ({
  __esModule: true,
  default: ({ open }: { open: boolean }) => (open ? <section>Appearance sheet</section> : null),
}));

jest.mock('widgets/sheets/start-day-sheet/start-day-sheet.component', () => ({
  __esModule: true,
  default: ({ open }: { open: boolean }) =>
    open ? <section>Period start day sheet</section> : null,
}));

describe('ProfilePage', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockDispatch.mockImplementation((action) => action);
    mockNavigate.mockClear();
    mockSignOutUser.mockReset();
    mockSignOutUser.mockResolvedValue(undefined);
    mockResetUnwrap.mockReset();
    mockResetUnwrap.mockResolvedValue(undefined);
    mockResetCurrentPeriodThunk.mockReset();
    mockResetCurrentPeriodThunk.mockReturnValue({ type: 'budget/resetCurrentPeriod', unwrap: mockResetUnwrap });
  });

  it('renders account identity and V3 Profile sections', () => {
    render(<ProfilePage />);

    expect(screen.getByTestId('user-avatar')).toBeInTheDocument();
    expect(screen.getByText('Ada Tide')).toBeInTheDocument();
    expect(screen.getByText('ada@example.com')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Explore' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Preferences' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Budget setup' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Data' })).toBeInTheDocument();
  });

  it('renders Explore destinations with route targets', () => {
    render(<ProfilePage />);

    expect(screen.getByRole('link', { name: /categories/i })).toHaveAttribute('href', '/categories');
    expect(screen.getByRole('link', { name: /history/i })).toHaveAttribute('href', '/history');
    expect(screen.getByText('Your budget structure')).toBeInTheDocument();
    expect(screen.getByText('Review previous periods')).toBeInTheDocument();
  });

  it('opens the correct settings sheets', () => {
    render(<ProfilePage />);

    fireEvent.click(screen.getByRole('button', { name: /language english/i }));
    expect(screen.getByText('Language sheet')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /currency eur/i }));
    expect(screen.getByText('Currency sheet')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /appearance dark/i }));
    expect(screen.getByText('Appearance sheet')).toBeInTheDocument();
  });

  it('displays current period budget setup values', () => {
    render(<ProfilePage />);

    expect(screen.getByRole('button', { name: /budget split 60% \/ 25% \/ 15%/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /period start day 10th of each month/i })).toBeInTheDocument();
  });

  it('opens reset confirmation without opening the language sheet', async () => {
    render(<ProfilePage />);

    fireEvent.click(screen.getByRole('button', { name: /reset current period/i }));

    expect(screen.getByRole('heading', { name: 'Reset current period?' })).toBeInTheDocument();
    expect(screen.queryByText('Language sheet')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Reset period' }));

    await waitFor(() => expect(mockResetCurrentPeriodThunk).toHaveBeenCalledWith({ uid: 'user-1' }));
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'budget/resetCurrentPeriod',
      unwrap: mockResetUnwrap,
    });
    expect(mockResetUnwrap).toHaveBeenCalledTimes(1);
  });

  it('awaits sign-out before navigating to login', async () => {
    render(<ProfilePage />);

    fireEvent.click(screen.getByRole('button', { name: /logout/i }));

    expect(mockSignOutUser).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login'));
  });
});
