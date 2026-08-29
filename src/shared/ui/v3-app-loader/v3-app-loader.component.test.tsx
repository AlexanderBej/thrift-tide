import React from 'react';
import { render, screen } from '@testing-library/react';

import '../../../i18n/i18n';
import V3AppLoader from './v3-app-loader.component';

jest.mock('../../../assets/thrift_tide_logo-light.svg', () => ({
  ReactComponent: () => <svg aria-hidden="true" />,
}));

jest.mock('../../../assets/thrift_tide_logo-dark.svg', () => ({
  ReactComponent: () => <svg aria-hidden="true" />,
}));

jest.mock('../spinners', () => ({
  LocalSpinner: () => <span data-testid="local-spinner" />,
}));

describe('V3AppLoader', () => {
  it('renders a branded accessible boot status', () => {
    render(<V3AppLoader />);

    expect(
      screen.getByRole('status', {
        name: 'Good to see you again. Getting your budget ready…',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Thrift Tide')).toBeInTheDocument();
    expect(screen.getByText('Good to see you again. Getting your budget ready…')).toBeInTheDocument();
    expect(screen.getByTestId('local-spinner')).toBeInTheDocument();
  });

  it('marks itself as leaving for the app transition', () => {
    render(<V3AppLoader leaving />);

    expect(screen.getByRole('status')).toHaveAttribute('data-leaving', 'true');
  });
});
