import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import '../../../i18n/i18n';
import TopNav from './top-nav.component';

const mockNavigate = jest.fn();

let mockLocation = {
  pathname: '/categories/needs',
  key: 'test',
};

jest.mock(
  'react-router-dom',
  () => ({
    useLocation: () => mockLocation,
    useNavigate: () => mockNavigate,
  }),
  { virtual: true },
);

jest.mock('react-redux', () => ({
  useSelector: (selector: () => unknown) => selector(),
}));

jest.mock('@store/settings-store', () => ({
  selectSettingsAppTheme: () => 'light',
}));

jest.mock('@shared/ui', () => ({
  Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

jest.mock('widgets/period-widget', () => ({
  PeriodWidget: () => <div data-testid="period-widget" />,
}));

jest.mock('../../../assets/thrift_tide_logo-light.svg', () => ({
  ReactComponent: () => <div data-testid="dashboard-logo" />,
}));

jest.mock('../../../assets/thrift_tide_logo-dark.svg', () => ({
  ReactComponent: () => <div data-testid="dashboard-logo-dark" />,
}));

describe('TopNav', () => {
  beforeEach(() => {
    mockNavigate.mockClear();

    mockLocation = {
      pathname: '/categories/needs',
      key: 'test',
    };
  });

  it.each([
    ['/categories/needs', 'Needs'],
    ['/categories/wants', 'Wants'],
    ['/categories/savings', 'Savings'],
  ])('uses the localized category title for %s', (pathname, title) => {
    mockLocation.pathname = pathname;

    render(<TopNav />);

    expect(screen.getByText(title)).toBeInTheDocument();
  });

  it('shows the period widget on category pages', () => {
    render(<TopNav />);

    expect(screen.getByTestId('period-widget')).toBeInTheDocument();
  });

  it('shows a back action on category pages', () => {
    render(<TopNav />);

    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
  });

  it('uses browser history for normal in-app back navigation', () => {
    render(<TopNav />);

    fireEvent.click(screen.getByRole('button', { name: /back/i }));

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('uses the route fallback when directly entering a category detail page', () => {
    mockLocation.key = 'default';

    render(<TopNav />);

    fireEvent.click(screen.getByRole('button', { name: /back/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/categories', {
      replace: true,
    });
  });

  it('does not show the period widget on history', () => {
    mockLocation.pathname = '/history';

    render(<TopNav />);

    expect(screen.queryByTestId('period-widget')).not.toBeInTheDocument();
  });

  it('does not show the period widget on insights', () => {
    mockLocation.pathname = '/insights';

    render(<TopNav />);

    expect(screen.getByText('Insights')).toBeInTheDocument();
    expect(screen.queryByTestId('period-widget')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument();
  });

  it('shows the dashboard logo instead of a page title on dashboard', () => {
    mockLocation.pathname = '/';

    render(<TopNav />);

    expect(screen.getByTestId('dashboard-logo')).toBeInTheDocument();
    expect(screen.getByTestId('period-widget')).toBeInTheDocument();
  });
});
