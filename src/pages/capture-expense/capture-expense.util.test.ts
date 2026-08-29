import { MonthDoc } from '../../api/models';
import { toYMD } from '../../shared/utils/format-data.util';
import {
  buildExpensePayload,
  clampInitialDate,
  createEmptyCaptureForm,
  deriveRecentGroups,
  getCaptureDateBounds,
  getCategoryForExpenseGroup,
  hasCaptureErrors,
  validateCaptureForm,
} from './capture-expense.util';

const monthDoc: MonthDoc = {
  month: '2026-08',
  income: 1000,
  percents: { needs: 0.5, wants: 0.3, savings: 0.2 },
  allocations: { needs: 500, wants: 300, savings: 200 },
  startDay: 1,
  periodStart: '2026-08-01T00:00:00.000Z',
  periodEnd: '2026-09-01T00:00:00.000Z',
  createdAt: null,
  updatedAt: null,
};

describe('capture expense utilities', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-08-29T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('derives category from the selected expense group', () => {
    expect(getCategoryForExpenseGroup('groceries')).toBe('needs');
    expect(getCategoryForExpenseGroup('dining')).toBe('wants');
    expect(getCategoryForExpenseGroup('investment')).toBe('savings');
  });

  it('derives recent groups by most recent unique loaded transaction', () => {
    const recent = deriveRecentGroups([
      { id: '1', date: '2026-08-02', amount: 10, category: 'needs', expenseGroup: 'rent' },
      { id: '2', date: '2026-08-28', amount: 12, category: 'wants', expenseGroup: 'dining' },
      { id: '3', date: '2026-08-27', amount: 8, category: 'needs', expenseGroup: 'groceries' },
      { id: '4', date: '2026-08-26', amount: 5, category: 'wants', expenseGroup: 'dining' },
    ]);

    expect(recent.map((group) => group.value)).toEqual(['dining', 'groceries', 'rent']);
  });

  it('defaults to today when today is valid for the selected period', () => {
    const bounds = getCaptureDateBounds(monthDoc);
    expect(toYMD(clampInitialDate(bounds) as Date)).toBe('2026-08-29');
  });

  it('does not allow future dates past today inside the selected period', () => {
    const bounds = getCaptureDateBounds(monthDoc);

    const errors = validateCaptureForm(
      {
        amount: '24.50',
        expenseGroup: 'groceries',
        date: new Date('2026-08-30T00:00:00.000Z'),
        note: '',
        noteExpanded: false,
      },
      bounds,
    );

    expect(errors.date).toBe('common:validation.date.invalid');
  });

  it('builds a compatible transaction payload with persisted category and expenseGroup', () => {
    const payload = buildExpensePayload({
      amount: '24.50',
      expenseGroup: 'groceries',
      date: new Date('2026-08-29T00:00:00.000Z'),
      note: 'Lidl',
      noteExpanded: true,
    });

    expect(payload).toEqual({
      amount: 24.5,
      category: 'needs',
      expenseGroup: 'groceries',
      date: '2026-08-29',
      note: 'Lidl',
    });
  });

  it('creates a continuation form that preserves date and resets entry fields', () => {
    const form = createEmptyCaptureForm(true, monthDoc, new Date('2026-08-14T00:00:00.000Z'));

    expect(form).toEqual({
      amount: '',
      expenseGroup: '',
      date: expect.any(Date),
      note: '',
      noteExpanded: true,
    });
    expect(toYMD(form.date as Date)).toBe('2026-08-14');
  });

  it('requires amount, group, and date before submit', () => {
    const errors = validateCaptureForm(
      {
        amount: '',
        expenseGroup: '',
        date: null,
        note: '',
        noteExpanded: false,
      },
      getCaptureDateBounds(monthDoc),
    );

    expect(hasCaptureErrors(errors)).toBe(true);
    expect(errors.amount).toBe('common:validation.amount.required');
    expect(errors.expenseGroup).toBe('common:validation.expGroup.required');
    expect(errors.date).toBe('common:validation.date.required');
  });
});
