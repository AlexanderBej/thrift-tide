import React from 'react';
import { render, screen } from '@testing-library/react';

import ProtectedRoute from './protected-route.util';

let mockAuthStatus: 'idle' | 'authenticated' | 'unauthenticated' = 'idle';
let mockAuthLoading = false;

jest.mock('react-redux', () => ({
  useSelector: (selector: () => unknown) => selector(),
}));

jest.mock('@store/auth-store', () => ({
  selectAuthStatus: () => mockAuthStatus,
  selectAuthLoading: () => mockAuthLoading,
}));

jest.mock(
  'react-router-dom',
  () => ({
    Navigate: ({ to }: { to: string }) => <div>Navigate to {to}</div>,
    useLocation: () => ({ pathname: '/transactions' }),
  }),
  { virtual: true },
);

describe('ProtectedRoute', () => {
  beforeEach(() => {
    mockAuthStatus = 'idle';
    mockAuthLoading = false;
  });

  it('renders no generic spinner while auth is unresolved', () => {
    render(
      <ProtectedRoute>
        <div>Private app</div>
      </ProtectedRoute>,
    );

    expect(screen.queryByText('Private app')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('redirects unauthenticated users after auth resolves', () => {
    mockAuthStatus = 'unauthenticated';

    render(
      <ProtectedRoute>
        <div>Private app</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText('Navigate to /login')).toBeInTheDocument();
  });

  it('renders children for authenticated users', () => {
    mockAuthStatus = 'authenticated';

    render(
      <ProtectedRoute>
        <div>Private app</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText('Private app')).toBeInTheDocument();
  });
});
