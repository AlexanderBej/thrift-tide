import React from 'react';
import { render, screen } from '@testing-library/react';

import '../../../i18n/i18n';
import TopNav from './top-nav.component';

let mockPathname = '/categories/needs';

jest.mock(
  'react-router-dom',
  () => ({
    useLocation: () => ({ pathname: mockPathname }),
    useNavigate: () => jest.fn(),
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
  TTIcon: () => <span aria-hidden="true" />,
}));

jest.mock('widgets/period-widget', () => ({
  PeriodWidget: () => <div data-testid="period-widget" />,
}));

describe('TopNav', () => {
  it.each([
    ['/categories/needs', 'Needs'],
    ['/categories/wants', 'Wants'],
    ['/categories/savings', 'Savings'],
  ])('uses the localized category title for %s', (pathname, title) => {
    mockPathname = pathname;

    render(<TopNav />);

    expect(screen.getByText(title)).toBeInTheDocument();
  });
});
