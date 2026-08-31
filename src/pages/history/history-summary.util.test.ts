import {
  buildCategoryUsage,
  formatHistoryMonthYear,
  formatHistoryPeriodRange,
  getHistoryOutcome,
  getTotalUsage,
} from './history-summary.util';

const fmtMoney = (value: number) => `€${value.toFixed(2)}`;

const summary = {
  income: 2400,
  allocations: { needs: 1200, wants: 720, savings: 480 },
  spent: { needs: 820, wants: 500, savings: 300 },
  totalSpent: 1620,
  totalTxns: 24,
  computedAt: '2027-04-10T00:00:00.000Z',
};

describe('History summary helpers', () => {
  it('formats month and visible inclusive period range from historical metadata', () => {
    expect(formatHistoryMonthYear('2026-02', 'en')).toBe('February 2026');
    expect(
      formatHistoryPeriodRange('2026-01-25T00:00:00.000Z', '2026-02-25T00:00:00.000Z', 'en'),
    ).toBe('Jan 25 - Feb 24');
  });

  it('derives closed-period outcomes without using computedAt', () => {
    expect(getHistoryOutcome(summary, fmtMoney)).toEqual({
      key: 'outcome.leftUnused',
      vars: { amount: '€780.00' },
      tone: 'positive',
    });

    expect(getHistoryOutcome({ ...summary, totalSpent: 2474.2 }, fmtMoney)).toEqual({
      key: 'outcome.overBudget',
      vars: { amount: '€74.20' },
      tone: 'danger',
    });

    expect(getHistoryOutcome({ ...summary, totalSpent: 2400 }, fmtMoney)).toEqual({
      key: 'outcome.fullyUsed',
      tone: 'warning',
    });
  });

  it('handles no spending and no budget as explicit outcomes', () => {
    expect(getHistoryOutcome({ ...summary, totalSpent: 0, totalTxns: 0 }, fmtMoney)).toEqual({
      key: 'outcome.noExpenses',
      tone: 'neutral',
    });

    expect(
      getHistoryOutcome(
        {
          ...summary,
          income: 0,
          allocations: { needs: 0, wants: 0, savings: 0 },
          totalSpent: 0,
          totalTxns: 0,
        },
        fmtMoney,
      ),
    ).toEqual({
      key: 'outcome.noBudget',
      tone: 'neutral',
    });
  });

  it('keeps total and category progress finite and visually clamped', () => {
    expect(getTotalUsage({ ...summary, totalSpent: 3650 })).toEqual({ percent: 152, progress: 1 });
    expect(getTotalUsage({ ...summary, income: 0 })).toEqual({ percent: null, progress: 0 });

    const usage = buildCategoryUsage({
      ...summary,
      allocations: { needs: 0, wants: 100, savings: 100 },
      spent: { needs: 25, wants: 150, savings: 104 },
    });

    expect(usage[0]).toMatchObject({ category: 'needs', percent: null, progress: 0 });
    expect(usage[1]).toMatchObject({ category: 'wants', percent: 150, progress: 1, tone: 'danger' });
    expect(usage[2]).toMatchObject({ category: 'savings', percent: 104, progress: 1, tone: 'positive' });
  });
});
