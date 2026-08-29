import React from 'react';
import { render, screen } from '@testing-library/react';

import Layout from './layout.component';

jest.mock(
  'react-router-dom',
  () => ({
    Outlet: () => <div>Outlet content</div>,
  }),
  { virtual: true },
);

jest.mock('@widgets', () => ({
  TopNav: () => <nav>Top navigation</nav>,
  BottomNav: () => <nav>Bottom navigation</nav>,
}));

describe('Layout', () => {
  it('renders the authenticated app shell without owning startup loading UI', () => {
    render(<Layout />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByText('Top navigation')).toBeInTheDocument();
    expect(screen.getByText('Outlet content')).toBeInTheDocument();
    expect(screen.getByText('Bottom navigation')).toBeInTheDocument();
  });
});
