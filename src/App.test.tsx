import React from 'react';
import { act, render, screen } from '@testing-library/react';

import App from './App';

const mockDispatch = jest.fn();
let mockUnsubscribe = jest.fn();
const mockInitApp = jest.fn(() => mockUnsubscribe);
let mockLoaderMounts = 0;
let mockState = {
  auth: { status: 'idle', loading: true },
  settings: { bootStatus: 'idle' },
  budget: { loadStatus: 'idle', hasBootstrapped: false },
};

jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector: (state: typeof mockState) => unknown) => selector(mockState),
}));

jest.mock('react-hot-toast', () => ({
  Toaster: () => <div data-testid="toaster" />,
}));

jest.mock('@shared/hooks', () => ({
  useSystemTheme: () => 'dark',
}));

jest.mock('@shared/ui/v3-app-loader', () => ({
  V3AppLoader: ({ leaving }: { leaving?: boolean }) => {
    const react = require('react');

    react.useEffect(() => {
      mockLoaderMounts += 1;
    }, []);

    return (
      <div role="status" data-leaving={leaving ? 'true' : 'false'}>
        Branded boot loader
      </div>
    );
  },
}));

jest.mock('@shared/providers', () => ({
  CaptureFeedbackProvider: ({ children }: React.PropsWithChildren) => <>{children}</>,
  initApp: () => mockInitApp(),
  ProtectedRoute: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

jest.mock(
  'react-router-dom',
  () => ({
    Route: ({ element }: { element?: React.ReactNode }) => <>{element}</>,
    Routes: ({ children }: React.PropsWithChildren) => <>{children}</>,
  }),
  { virtual: true },
);

jest.mock('@pages', () => ({
  CategoryPage: () => <div>Category page</div>,
  CaptureExpense: () => <div>Capture expense</div>,
  History: () => <div>History page</div>,
  CategoriesPage: () => <div>Categories page</div>,
  Insights: () => <div>Insights page</div>,
  Layout: () => <div>Authenticated layout</div>,
  Login: () => <div>Login page</div>,
  Onboarding: () => <div>Onboarding page</div>,
  Transaction: () => <div>Transactions page</div>,
  ProfilePage: () => <div>Profile page</div>,
}));

jest.mock('./pages/dashboard/dashboard.component', () => () => <div>Dashboard page</div>);
jest.mock('./pages/categories/categories.component', () => () => <div>Categories page</div>);
jest.mock('./pages/history/history.component', () => () => <div>History page</div>);

describe('App startup loader', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-08-29T12:00:00.000Z'));
    mockUnsubscribe = jest.fn();
    mockDispatch.mockClear();
    mockInitApp.mockClear();
    mockInitApp.mockImplementation(() => mockUnsubscribe);
    mockLoaderMounts = 0;
    mockState = {
      auth: { status: 'idle', loading: true },
      settings: { bootStatus: 'idle' },
      budget: { loadStatus: 'idle', hasBootstrapped: false },
    };
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows the branded loader immediately while auth is unresolved', () => {
    render(<App />);

    expect(screen.getByRole('status')).toHaveTextContent('Branded boot loader');
    expect(screen.queryByText('Generic PageSpinner')).not.toBeInTheDocument();
  });

  it('continues the same branded loader phase after auth resolves while app boot continues', () => {
    const { rerender } = render(<App />);

    expect(mockLoaderMounts).toBe(1);

    mockState = {
      auth: { status: 'authenticated', loading: false },
      settings: { bootStatus: 'loading' },
      budget: { loadStatus: 'idle', hasBootstrapped: false },
    };
    rerender(<App />);

    expect(screen.getByRole('status')).toHaveTextContent('Branded boot loader');
    expect(mockLoaderMounts).toBe(1);
  });

  it('uses one short minimum timer that does not restart after auth resolution', () => {
    const { rerender } = render(<App />);

    act(() => {
      jest.advanceTimersByTime(400);
    });

    mockState = {
      auth: { status: 'authenticated', loading: false },
      settings: { bootStatus: 'loading' },
      budget: { loadStatus: 'idle', hasBootstrapped: false },
    };
    rerender(<App />);

    act(() => {
      jest.advanceTimersByTime(100);
    });

    mockState = {
      auth: { status: 'authenticated', loading: false },
      settings: { bootStatus: 'ready' },
      budget: { loadStatus: 'ready', hasBootstrapped: true },
    };
    rerender(<App />);

    act(() => {
      jest.advanceTimersByTime(99);
    });
    expect(screen.getByRole('status')).toHaveAttribute('data-leaving', 'false');

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(screen.getByRole('status')).toHaveAttribute('data-leaving', 'true');

    act(() => {
      jest.advanceTimersByTime(180);
    });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('renders the app after authenticated boot completes', () => {
    const { rerender } = render(<App />);

    mockState = {
      auth: { status: 'authenticated', loading: false },
      settings: { bootStatus: 'ready' },
      budget: { loadStatus: 'ready', hasBootstrapped: true },
    };
    rerender(<App />);

    act(() => {
      jest.advanceTimersByTime(780);
    });

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByText('Authenticated layout')).toBeInTheDocument();
  });

  it('renders the public login flow after auth resolves unauthenticated', () => {
    mockState = {
      auth: { status: 'unauthenticated', loading: false },
      settings: { bootStatus: 'idle' },
      budget: { loadStatus: 'idle', hasBootstrapped: false },
    };

    render(<App />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('does not replay the branded loader for normal period switching after budget bootstrap', () => {
    mockState = {
      auth: { status: 'authenticated', loading: false },
      settings: { bootStatus: 'ready' },
      budget: { loadStatus: 'ready', hasBootstrapped: true },
    };

    const { rerender } = render(<App />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByText('Authenticated layout')).toBeInTheDocument();

    mockState = {
      auth: { status: 'authenticated', loading: false },
      settings: { bootStatus: 'ready' },
      budget: { loadStatus: 'loading', hasBootstrapped: true },
    };
    rerender(<App />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByText('Authenticated layout')).toBeInTheDocument();
  });
});
