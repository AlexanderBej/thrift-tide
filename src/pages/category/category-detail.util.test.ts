import {
  buildCategoryDetailGroups,
  buildCategoryDetailSummary,
  isCategoryDetailCategory,
} from './category-detail.util';

describe('Category Detail V3 helpers', () => {
  it('validates only supported category route params', () => {
    expect(isCategoryDetailCategory('needs')).toBe(true);
    expect(isCategoryDetailCategory('wants')).toBe(true);
    expect(isCategoryDetailCategory('savings')).toBe(true);
    expect(isCategoryDetailCategory('foo')).toBe(false);
    expect(isCategoryDetailCategory(undefined)).toBe(false);
  });

  it('orders active groups by total and zero groups by taxonomy order', () => {
    const rows = buildCategoryDetailGroups({
      category: 'needs',
      categoryActual: 269.6,
      byExpGroup: [
        { expGroup: 'rent', total: 22.6 },
        { expGroup: 'utilities', total: 9.5 },
        { expGroup: 'groceries', total: 237.5 },
      ],
    });

    expect(rows).toHaveLength(7);
    expect(rows.map((row) => row.group.value)).toEqual([
      'groceries',
      'rent',
      'utilities',
      'transport',
      'insurance',
      'healthcare',
      'education',
    ]);
    expect(rows[0].compositionPercent).toBe(88);
    expect(rows[3].compositionPercent).toBeNull();
  });

  it('does not calculate invalid percentages when category activity is zero', () => {
    const rows = buildCategoryDetailGroups({
      category: 'wants',
      categoryActual: 0,
      byExpGroup: [],
    });

    expect(rows).toHaveLength(7);
    expect(rows.every((row) => row.total === 0)).toBe(true);
    expect(rows.every((row) => row.compositionPercent == null)).toBe(true);
  });

  it('uses current, historical, and over-allocation semantics for needs/wants', () => {
    const baseCard = {
      key: 'needs' as const,
      title: 'Needs',
      allocated: 1200,
      spent: 269.6,
      remaining: 930.4,
      progress: 0.22,
    };

    expect(
      buildCategoryDetailSummary({
        category: 'needs',
        percents: { needs: 0.5, wants: 0.3, savings: 0.2 },
        card: baseCard,
        pulseRow: { key: 'needs', amount: 930.4, amountState: 'left', progress: 0.22, percent: 22, tone: 'muted' },
        periodPhase: 'current',
      }).statusKind,
    ).toBe('left');

    expect(
      buildCategoryDetailSummary({
        category: 'needs',
        percents: { needs: 0.5, wants: 0.3, savings: 0.2 },
        card: baseCard,
        pulseRow: { key: 'needs', amount: 930.4, amountState: 'left', progress: 0.22, percent: 22, tone: 'muted' },
        periodPhase: 'past',
      }).statusKind,
    ).toBe('unused');

    const over = buildCategoryDetailSummary({
      category: 'wants',
      percents: { needs: 0.5, wants: 0.3, savings: 0.2 },
      card: { ...baseCard, key: 'wants', title: 'Wants', allocated: 720, spent: 798.5, remaining: 0, progress: 1 },
      pulseRow: { key: 'wants', amount: 78.5, amountState: 'over', progress: 1, percent: 111, tone: 'danger' },
      periodPhase: 'current',
    });

    expect(over.statusKind).toBe('over');
    expect(over.progressTone).toBe('danger');
  });

  it('keeps savings goal semantics positive at and above target', () => {
    const reached = buildCategoryDetailSummary({
      category: 'savings',
      percents: { needs: 0.5, wants: 0.3, savings: 0.2 },
      card: { key: 'savings', title: 'Savings', allocated: 480, spent: 480, remaining: 0, progress: 1 },
      pulseRow: { key: 'savings', amount: 480, amountState: 'goalReached', progress: 1, percent: 100, tone: 'success' },
      periodPhase: 'current',
    });
    const above = buildCategoryDetailSummary({
      category: 'savings',
      percents: { needs: 0.5, wants: 0.3, savings: 0.2 },
      card: { key: 'savings', title: 'Savings', allocated: 480, spent: 500, remaining: 0, progress: 1 },
      pulseRow: { key: 'savings', amount: 20, amountState: 'aboveGoal', progress: 1, percent: 104, tone: 'success' },
      periodPhase: 'current',
    });

    expect(reached.statusKind).toBe('goalReached');
    expect(reached.progressTone).toBe('success');
    expect(above.statusKind).toBe('aboveGoal');
    expect(above.progressTone).toBe('success');
  });

  it('returns safe no-budget semantics for zero allocation', () => {
    const summary = buildCategoryDetailSummary({
      category: 'needs',
      percents: { needs: 0.5, wants: 0.3, savings: 0.2 },
      card: { key: 'needs', title: 'Needs', allocated: 0, spent: 0, remaining: 0, progress: 0 },
      periodPhase: 'future',
    });

    expect(summary.isNoBudget).toBe(true);
    expect(summary.statusKind).toBe('noBudget');
    expect(summary.progress).toBe(0);
  });
});
