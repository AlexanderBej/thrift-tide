import {
  buildBudgetOutcomes,
  buildCategoryPattern,
  buildInsightsAnalytics,
  buildSavingsConsistency,
  buildSpendingComparison,
  formatCompactCurrency,
  getUsableClosedInsightPeriods,
  selectWatchPattern,
  UsableInsightPeriod,
} from './insights-analytics.util';

const now = new Date('2026-08-31T12:00:00.000Z');

const makePeriod = (
  month: string,
  overrides: Partial<UsableInsightPeriod> = {},
): UsableInsightPeriod => ({
  id: month,
  month,
  income: 2400,
  percents: { needs: 0.5, wants: 0.3, savings: 0.2 },
  allocations: { needs: 1200, wants: 720, savings: 480 },
  startDay: 25,
  periodStart: `${month}-01T00:00:00.000Z`,
  periodEnd: `${month}-28T00:00:00.000Z`,
  createdAt: null,
  updatedAt: null,
  summary: {
    totalSpent: 1800,
    spent: { needs: 900, wants: 500, savings: 400 },
    totalTxns: 20,
    income: 2400,
    allocations: { needs: 1200, wants: 720, savings: 480 },
    computedAt: `${month}-28T01:00:00.000Z`,
  },
  ...overrides,
});

describe('Insights V3 analytics', () => {
  it('uses the latest 6 usable closed summaries in chronological order', () => {
    const rows = [
      makePeriod('2026-09'),
      { ...makePeriod('2026-08'), summary: undefined },
      makePeriod('2026-07'),
      makePeriod('2026-06'),
      makePeriod('2026-05'),
      makePeriod('2026-04'),
      makePeriod('2026-03'),
      makePeriod('2026-02'),
      makePeriod('2026-01'),
    ];
    rows[0].periodEnd = '2026-10-01T00:00:00.000Z';

    expect(getUsableClosedInsightPeriods(rows as any, now).map((row) => row.month)).toEqual([
      '2026-02',
      '2026-03',
      '2026-04',
      '2026-05',
      '2026-06',
      '2026-07',
    ]);
  });

  it('compares latest 3 average spending against the previous 3 when six periods exist', () => {
    const periods = [200, 200, 200, 180, 180, 180].map((spent, index) =>
      makePeriod(`2026-0${index + 1}`, { summary: { ...makePeriod('2026-01').summary, totalSpent: spent } }),
    );

    const comparison = buildSpendingComparison(periods);

    expect(comparison.direction).toBe('down');
    expect(comparison.percentChange).toBeCloseTo(-0.1);
    expect(comparison.comparisonSize).toBe(3);
  });

  it('classifies spending increase, insignificant change, insufficient data, and zero spending safely', () => {
    expect(
      buildSpendingComparison([
        makePeriod('2026-01', { summary: { ...makePeriod('2026-01').summary, totalSpent: 100 } }),
        makePeriod('2026-02', { summary: { ...makePeriod('2026-02').summary, totalSpent: 130 } }),
      ]).direction,
    ).toBe('up');

    expect(
      buildSpendingComparison([
        makePeriod('2026-01', { summary: { ...makePeriod('2026-01').summary, totalSpent: 100 } }),
        makePeriod('2026-02', { summary: { ...makePeriod('2026-02').summary, totalSpent: 100.4 } }),
      ]).direction,
    ).toBe('flat');

    expect(buildSpendingComparison([makePeriod('2026-01')]).direction).toBe('insufficient');

    const zero = buildSpendingComparison([
      makePeriod('2026-01', { summary: { ...makePeriod('2026-01').summary, totalSpent: 0 } }),
      makePeriod('2026-02', { summary: { ...makePeriod('2026-02').summary, totalSpent: 0 } }),
    ]);
    expect(zero.direction).toBe('flat');
    expect(zero.percentChange).toBe(0);
  });

  it('calculates budget outcomes and excludes zero-income periods', () => {
    const outcomes = buildBudgetOutcomes([
      makePeriod('2026-01', { summary: { ...makePeriod('2026-01').summary, income: 1000, totalSpent: 800 } }),
      makePeriod('2026-02', { summary: { ...makePeriod('2026-02').summary, income: 1000, totalSpent: 1000 } }),
      makePeriod('2026-03', { summary: { ...makePeriod('2026-03').summary, income: 1000, totalSpent: 1200 } }),
      makePeriod('2026-04', { summary: { ...makePeriod('2026-04').summary, income: 0, totalSpent: 0 } }),
    ]);

    expect(outcomes).toMatchObject({
      budgetedPeriods: 3,
      trackedPeriods: 3,
      under: 1,
      on: 1,
      over: 1,
      averageUnused: 200 / 3,
      strongestFinish: { month: '2026-01', unused: 200 },
    });
  });

  it('excludes zero-transaction periods from tracked budget success metrics', () => {
    const outcomes = buildBudgetOutcomes([
      makePeriod('2026-01', {
        summary: { ...makePeriod('2026-01').summary, income: 1000, totalSpent: 0, totalTxns: 0 },
      }),
      makePeriod('2026-02', {
        summary: { ...makePeriod('2026-02').summary, income: 1000, totalSpent: 800, totalTxns: 8 },
      }),
      makePeriod('2026-03', {
        summary: { ...makePeriod('2026-03').summary, income: 1000, totalSpent: 1200, totalTxns: 4 },
      }),
    ]);

    expect(outcomes).toMatchObject({
      budgetedPeriods: 3,
      trackedPeriods: 2,
      under: 1,
      on: 0,
      over: 1,
      averageUnused: 100,
      strongestFinish: { month: '2026-02', unused: 200 },
    });
  });

  it('formats spending chart labels compactly while keeping zero values safe', () => {
    const formatMoney = (value: number) => `€${value.toFixed(2)}`;

    expect(formatCompactCurrency(1879, formatMoney)).toBe('€1.88k');
    expect(formatCompactCurrency(1159, formatMoney)).toBe('€1.16k');
    expect(formatCompactCurrency(598, formatMoney)).toBe('€598');
    expect(formatCompactCurrency(0, formatMoney)).toBe('€0');
    expect(formatCompactCurrency(1578, formatMoney)).toBe('€1.58k');
    expect(formatCompactCurrency(1200, (value) => `${value.toFixed(2)} RON`)).toBe('1.2k RON');
  });

  it('uses historical snapshot allocations for category usage and treats zero allocation as unavailable', () => {
    const pattern = buildCategoryPattern(
      [
        makePeriod('2026-01', {
          allocations: { needs: 9999, wants: 9999, savings: 9999 },
          summary: {
            ...makePeriod('2026-01').summary,
            spent: { needs: 60, wants: 100, savings: 120 },
            allocations: { needs: 100, wants: 0, savings: 100 },
          },
        }),
        makePeriod('2026-02', {
          summary: {
            ...makePeriod('2026-02').summary,
            spent: { needs: 130, wants: 100, savings: 130 },
            allocations: { needs: 100, wants: 0, savings: 100 },
          },
        }),
      ],
      'needs',
    );

    expect(pattern.latestUsage).toBe(1.3);
    expect(pattern.trend).toBe('trendingUp');
    expect(buildCategoryPattern([makePeriod('2026-01')], 'wants').trend).toBe('insufficient');
    expect(
      buildCategoryPattern(
        [
          makePeriod('2026-01', {
            summary: { ...makePeriod('2026-01').summary, spent: { needs: 0, wants: 10, savings: 0 }, allocations: { needs: 0, wants: 0, savings: 0 } },
          }),
        ],
        'wants',
      ).latestUsage,
    ).toBeNull();
  });

  it('classifies category trend direction, stable values, and savings over 100 as positive consistency', () => {
    expect(
      buildCategoryPattern(
        [
          makePeriod('2026-01', { summary: { ...makePeriod('2026-01').summary, spent: { needs: 50, wants: 0, savings: 0 }, allocations: { needs: 100, wants: 1, savings: 1 } } }),
          makePeriod('2026-02', { summary: { ...makePeriod('2026-02').summary, spent: { needs: 42, wants: 0, savings: 0 }, allocations: { needs: 100, wants: 1, savings: 1 } } }),
        ],
        'needs',
      ).trend,
    ).toBe('trendingDown');

    expect(
      buildCategoryPattern(
        [
          makePeriod('2026-01', { summary: { ...makePeriod('2026-01').summary, spent: { needs: 50, wants: 0, savings: 0 }, allocations: { needs: 100, wants: 1, savings: 1 } } }),
          makePeriod('2026-02', { summary: { ...makePeriod('2026-02').summary, spent: { needs: 53, wants: 0, savings: 0 }, allocations: { needs: 100, wants: 1, savings: 1 } } }),
        ],
        'needs',
      ).trend,
    ).toBe('stable');

    expect(
      buildCategoryPattern(
        [
          makePeriod('2026-01', { summary: { ...makePeriod('2026-01').summary, spent: { needs: 0, wants: 0, savings: 100 }, allocations: { needs: 1, wants: 1, savings: 100 } } }),
          makePeriod('2026-02', { summary: { ...makePeriod('2026-02').summary, spent: { needs: 0, wants: 0, savings: 120 }, allocations: { needs: 1, wants: 1, savings: 100 } } }),
        ],
        'savings',
      ).trend,
    ).toBe('consistent');
  });

  it('calculates savings consistency metrics and current streak', () => {
    const savings = buildSavingsConsistency([
      makePeriod('2026-01', { summary: { ...makePeriod('2026-01').summary, spent: { needs: 0, wants: 0, savings: 80 }, allocations: { needs: 1, wants: 1, savings: 100 } } }),
      makePeriod('2026-02', { summary: { ...makePeriod('2026-02').summary, spent: { needs: 0, wants: 0, savings: 100 }, allocations: { needs: 1, wants: 1, savings: 100 } } }),
      makePeriod('2026-03', { summary: { ...makePeriod('2026-03').summary, spent: { needs: 0, wants: 0, savings: 120 }, allocations: { needs: 1, wants: 1, savings: 100 } } }),
    ]);

    expect(savings.reached).toBe(2);
    expect(savings.averageCompletion).toBeCloseTo(1);
    expect(savings.currentStreak).toBe(2);
    expect(savings.sequence.map((item) => item.reached)).toEqual([false, true, true]);
    expect(buildSavingsConsistency([makePeriod('2026-01', { summary: { ...makePeriod('2026-01').summary, allocations: { needs: 1, wants: 1, savings: 0 } } })]).validPeriods).toBe(0);
  });

  it('keeps missed and unavailable savings sequence states distinct', () => {
    const savings = buildSavingsConsistency([
      makePeriod('2026-01', {
        summary: {
          ...makePeriod('2026-01').summary,
          spent: { needs: 0, wants: 0, savings: 80 },
          allocations: { needs: 1, wants: 1, savings: 100 },
        },
      }),
      makePeriod('2026-02', {
        summary: {
          ...makePeriod('2026-02').summary,
          spent: { needs: 0, wants: 0, savings: 100 },
          allocations: { needs: 1, wants: 1, savings: 100 },
        },
      }),
      makePeriod('2026-03', {
        summary: { ...makePeriod('2026-03').summary, allocations: { needs: 1, wants: 1, savings: 0 } },
      }),
    ]);

    expect(savings.sequence.map((item) => item.reached)).toEqual([false, true, null]);
  });

  it('selects the strongest pattern by priority', () => {
    const analytics = buildInsightsAnalytics(
      [
        makePeriod('2026-01', { summary: { ...makePeriod('2026-01').summary, totalSpent: 100, spent: { needs: 50, wants: 50, savings: 100 }, allocations: { needs: 100, wants: 100, savings: 100 } } }),
        makePeriod('2026-02', { summary: { ...makePeriod('2026-02').summary, totalSpent: 160, spent: { needs: 50, wants: 120, savings: 100 }, allocations: { needs: 100, wants: 100, savings: 100 } } }),
      ],
      now,
    );

    expect(analytics.watch).toMatchObject({ kind: 'categoryOverspendTrend', category: 'wants' });

    expect(
      selectWatchPattern({
        comparison: { direction: 'up', percentChange: 0.2, latestAverage: 120, previousAverage: 100, comparisonSize: 1 },
        categoryPatterns: [
          { category: 'needs', trend: 'stable', latestUsage: 0.8, pointChange: 0, values: [] },
          { category: 'wants', trend: 'stable', latestUsage: 0.8, pointChange: 0, values: [{ month: 'a', usage: 0.4 }, { month: 'b', usage: 0.9 }] },
          { category: 'savings', trend: 'consistent', latestUsage: 1, pointChange: 0, values: [] },
        ],
        savings: { validPeriods: 4, reached: 4, averageCompletion: 1, currentStreak: 4, sequence: [] },
      }).kind,
    ).toBe('categoryVolatile');
  });

  it('returns min and max usage for volatile category watch copy', () => {
    const watch = selectWatchPattern({
      comparison: {
        direction: 'flat',
        percentChange: 0,
        latestAverage: 100,
        previousAverage: 100,
        comparisonSize: 1,
      },
      categoryPatterns: [
        {
          category: 'needs',
          trend: 'stable',
          latestUsage: 1.12,
          pointChange: 0,
          values: [
            { month: '2026-01', usage: 0 },
            { month: '2026-02', usage: 1.12 },
          ],
        },
        { category: 'wants', trend: 'stable', latestUsage: 0.8, pointChange: 0, values: [] },
        { category: 'savings', trend: 'consistent', latestUsage: 1, pointChange: 0, values: [] },
      ],
      savings: { validPeriods: 0, reached: 0, averageCompletion: null, currentStreak: 0, sequence: [] },
    });

    expect(watch).toMatchObject({
      kind: 'categoryVolatile',
      fromPercent: 0,
      toPercent: 1.12,
      rangePercent: 1.12,
    });
  });
});
