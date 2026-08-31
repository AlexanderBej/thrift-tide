import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import '../../i18n/i18n';
import BudgetSplitSheet from './budget-split-sheet/budget-split-sheet.component';
import CurrencySheet from './currency-sheet/currency-sheet.component';
import LanguageSheet from './language-sheet/language-sheet.component';
import StartDaySheet from './start-day-sheet/start-day-sheet.component';
import ThemeSheet from './theme-sheet/theme-sheet.component';

const mockDispatch = jest.fn((action) => action);
const mockOnOpenChange = jest.fn();
const mockSaveLanguageThunk = jest.fn();
const mockUpdateCurrencyThunk = jest.fn();
const mockSetAppThemeThunk = jest.fn();
const mockUpdateDefaultPercentsThunk = jest.fn();
const mockSaveStartDayThunk = jest.fn();
const mockUnwrap = jest.fn();

let mockLanguage = 'en';
let mockCurrency = 'EUR';
let mockTheme = 'dark';
let mockDefaultPercents = { needs: 0.5, wants: 0.3, savings: 0.2 };
let mockStartDay = 25;
let mockBudgetDoc: any = null;

jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector: () => unknown) => selector(),
}));

jest.mock('@store/auth-store', () => ({
  selectAuthUser: () => ({ uuid: 'user-1' }),
}));

jest.mock('@store/settings-store', () => ({
  selectSettingsAppLanguage: () => mockLanguage,
  selectSettingsCurrency: () => mockCurrency,
  selectSettingsAppTheme: () => mockTheme,
  selectSettingsDefaultPercents: () => mockDefaultPercents,
  selectSettingsBudgetStartDay: () => mockStartDay,
  saveLanguageThunk: (payload: unknown) => mockSaveLanguageThunk(payload),
  updateCurrencyThunk: (payload: unknown) => mockUpdateCurrencyThunk(payload),
  setAppThemeThunk: (payload: unknown) => mockSetAppThemeThunk(payload),
  updateDefaultPercentsThunk: (payload: unknown) => mockUpdateDefaultPercentsThunk(payload),
  saveStartDayThunk: (payload: unknown) => mockSaveStartDayThunk(payload),
}));

jest.mock('@store/budget-store', () => ({
  selectBudgetDoc: () => mockBudgetDoc,
}));

jest.mock('@shared/ui', () => ({
  BaseSheet: ({
    open,
    title,
    description,
    children,
    btnLabel,
    btnDisabled,
    onButtonClick,
  }: React.PropsWithChildren<{
    open: boolean;
    title: string;
    description?: string;
    btnLabel?: string;
    btnDisabled?: boolean;
    onButtonClick?: () => void;
  }>) =>
    open ? (
      <section aria-label={title}>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
        {children}
        {btnLabel && (
          <button type="button" disabled={btnDisabled} onClick={onButtonClick}>
            {btnLabel}
          </button>
        )}
      </section>
    ) : null,
  Button: ({
    children,
    ariaLabel,
    disabled,
    onClick,
  }: React.PropsWithChildren<{
    ariaLabel?: string;
    disabled?: boolean;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
  }>) => (
    <button type="button" aria-label={ariaLabel} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  ),
  InfoBlock: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  InfoPopover: ({ children }: React.PropsWithChildren) => <span>{children}</span>,
  TTIcon: () => <span aria-hidden="true" />,
}));

jest.mock(
  'react-mobile-picker',
  () => {
    const Picker = ({
      children,
      value,
      onChange,
    }: React.PropsWithChildren<{
      value: { day: string };
      onChange: (value: { day: string }) => void;
    }>) => (
      <div>
        {children}
        <span data-testid="selected-picker-day">{value.day}</span>
        <button type="button" onClick={() => onChange({ day: '7' })}>
          Choose 7
        </button>
        <button type="button" onClick={() => onChange({ day: '14' })}>
          Choose 14
        </button>
        <button type="button" onClick={() => onChange({ day: '26' })}>
          Choose 26
        </button>
      </div>
    );
    Picker.Column = ({ children }: React.PropsWithChildren) => <div>{children}</div>;
    Picker.Item = ({
      children,
      value,
    }: React.PropsWithChildren<{
      value: string;
      children: (args: { selected: boolean }) => React.ReactNode;
    }>) => <div data-value={value}>{children({ selected: value === '25' })}</div>;
    return Picker;
  },
  { virtual: true },
);

describe('Profile settings sheets', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockDispatch.mockImplementation((action) => action);
    mockOnOpenChange.mockClear();
    mockUnwrap.mockReset();
    mockUnwrap.mockResolvedValue(undefined);
    mockSaveLanguageThunk.mockReset();
    mockUpdateCurrencyThunk.mockReset();
    mockSetAppThemeThunk.mockReset();
    mockUpdateDefaultPercentsThunk.mockReset();
    mockSaveStartDayThunk.mockReset();
    mockSaveLanguageThunk.mockReturnValue({ unwrap: mockUnwrap });
    mockUpdateCurrencyThunk.mockReturnValue({ unwrap: mockUnwrap });
    mockSetAppThemeThunk.mockReturnValue({ unwrap: mockUnwrap });
    mockUpdateDefaultPercentsThunk.mockReturnValue({ unwrap: mockUnwrap });
    mockSaveStartDayThunk.mockReturnValue({ unwrap: mockUnwrap });
    mockLanguage = 'en';
    mockCurrency = 'EUR';
    mockTheme = 'dark';
    mockDefaultPercents = { needs: 0.5, wants: 0.3, savings: 0.2 };
    mockStartDay = 25;
    mockBudgetDoc = null;
  });

  it('language sheet marks the selected option and saves immediately on selection', async () => {
    render(<LanguageSheet open onOpenChange={mockOnOpenChange} />);

    expect(screen.getByRole('button', { name: /english/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    fireEvent.click(screen.getByRole('button', { name: /română/i }));

    await waitFor(() =>
      expect(mockSaveLanguageThunk).toHaveBeenCalledWith({ uid: 'user-1', language: 'ro' }),
    );
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('currency and appearance sheets open the correct atomic options', async () => {
    render(<CurrencySheet open onOpenChange={mockOnOpenChange} />);
    fireEvent.click(screen.getByRole('button', { name: /romanian leu/i }));

    await waitFor(() =>
      expect(mockUpdateCurrencyThunk).toHaveBeenCalledWith({ uid: 'user-1', currency: 'RON' }),
    );

    render(<ThemeSheet open onOpenChange={mockOnOpenChange} />);
    fireEvent.click(screen.getByRole('button', { name: /light/i }));

    await waitFor(() =>
      expect(mockSetAppThemeThunk).toHaveBeenCalledWith({ uid: 'user-1', theme: 'light' }),
    );
  });

  it('budget split displays current values and submits existing update semantics', async () => {
    mockBudgetDoc = { percents: { needs: 0.6, wants: 0.25, savings: 0.15 } };

    render(<BudgetSplitSheet open onOpenChange={mockOnOpenChange} />);

    expect(screen.getAllByText('60%').length).toBeGreaterThan(0);
    expect(screen.getAllByText('25%').length).toBeGreaterThan(0);
    expect(screen.getAllByText('15%').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: /increase needs/i }));
    fireEvent.click(screen.getByRole('button', { name: /update budget split/i }));

    await waitFor(() =>
      expect(mockUpdateDefaultPercentsThunk).toHaveBeenCalledWith({
        uid: 'user-1',
        percents: { needs: 0.61, wants: 0.24, savings: 0.15 },
        startThisMonth: false,
      }),
    );
  });

  it('start day sheet uses a 1-28 picker and submits the selected value', async () => {
    render(<StartDaySheet open onOpenChange={mockOnOpenChange} />);

    expect(screen.getByLabelText('Budget period start day')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('28')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Choose 26' }));
    expect(screen.getByText(/26th of each month/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /update start day/i }));

    await waitFor(() =>
      expect(mockSaveStartDayThunk).toHaveBeenCalledWith({
        uid: 'user-1',
        startDay: 26,
        startThisMonth: false,
      }),
    );
  });

  it('start day sheet keeps current-period and future-period drafts scoped separately', async () => {
    mockStartDay = 12;
    mockBudgetDoc = { startDay: 5 };

    render(<StartDaySheet open onOpenChange={mockOnOpenChange} />);

    expect(screen.getByText(/12th of each month/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /this period/i })).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: /this period/i }));
    expect(screen.getByText(/5th of each month/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Choose 7' }));
    expect(screen.getByText(/7th of each month/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /future periods/i }));
    expect(screen.getByText(/12th of each month/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Choose 14' }));
    fireEvent.click(screen.getByRole('button', { name: /update start day/i }));

    await waitFor(() =>
      expect(mockSaveStartDayThunk).toHaveBeenCalledWith({
        uid: 'user-1',
        startDay: 14,
        startThisMonth: false,
      }),
    );

    fireEvent.click(screen.getByRole('button', { name: /this period/i }));
    fireEvent.click(screen.getByRole('button', { name: /update start day/i }));

    await waitFor(() =>
      expect(mockSaveStartDayThunk).toHaveBeenLastCalledWith({
        uid: 'user-1',
        startDay: 7,
        startThisMonth: true,
      }),
    );
  });
});
