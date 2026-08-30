import {
  getAllocationSegments,
  getCategoryGroupPreview,
  getCategoryOverviewItems,
  normalizePercent,
} from './categories-overview.util';

const baseCards = [
  { key: 'needs', title: 'Needs', allocated: 1200, spent: 269.6, remaining: 930.4, progress: 0.22 },
  { key: 'wants', title: 'Wants', allocated: 720, spent: 798.5, remaining: 0, progress: 1 },
  { key: 'savings', title: 'Savings', allocated: 480, spent: 320, remaining: 160, progress: 0.67 },
] as const;

describe('Categories V3 overview helpers', () => {
  it('derives selected-period allocation percentages and split data defensively', () => {
    expect(
      getAllocationSegments({
        needs: 0.5,
        wants: 0.3,
        savings: 0.2,
      }),
    ).toEqual([
      { key: 'needs', percent: 50 },
      { key: 'wants', percent: 30 },
      { key: 'savings', percent: 20 },
    ]);

    expect(normalizePercent(Number.NaN)).toBe(0);
    expect(normalizePercent(1.4)).toBe(100);
    expect(normalizePercent(-0.2)).toBe(0);
  });

  it('keeps real overage copy semantics for Needs and Wants', () => {
    const items = getCategoryOverviewItems({
      cards: [...baseCards],
      percents: { needs: 0.5, wants: 0.3, savings: 0.2 },
      phase: 'current',
      pulseRows: [
        {
          key: 'needs',
          amount: 930.4,
          amountState: 'left',
          progress: 0.22,
          percent: 22,
          tone: 'muted',
        },
        {
          key: 'wants',
          amount: 78.5,
          amountState: 'over',
          progress: 1,
          percent: 111,
          tone: 'danger',
        },
        {
          key: 'savings',
          amount: 160,
          amountState: 'toGoal',
          progress: 0.67,
          percent: 67,
          tone: 'muted',
        },
      ],
    });

    expect(items[0]).toMatchObject({ key: 'needs', amount: 930.4, amountKind: 'left' });
    expect(items[1]).toMatchObject({
      key: 'wants',
      amount: 78.5,
      amountKind: 'over',
      progress: 1,
      progressTone: 'danger',
    });
  });

  it('uses snapshot unused copy for historical Needs and Wants', () => {
    const items = getCategoryOverviewItems({
      cards: [...baseCards],
      percents: { needs: 0.5, wants: 0.3, savings: 0.2 },
      phase: 'past',
      pulseRows: [
        {
          key: 'needs',
          amount: 930.4,
          amountState: 'left',
          progress: 0.22,
          percent: 22,
          tone: 'muted',
        },
        {
          key: 'wants',
          amount: 78.5,
          amountState: 'over',
          progress: 1,
          percent: 111,
          tone: 'danger',
        },
        {
          key: 'savings',
          amount: 160,
          amountState: 'toGoal',
          progress: 0.67,
          percent: 67,
          tone: 'muted',
        },
      ],
    });

    expect(items[0].amountKind).toBe('unused');
    expect(items[1].amountKind).toBe('over');
  });

  it('aligns Savings with Dashboard goal semantics', () => {
    const below = getCategoryOverviewItems({
      cards: [...baseCards],
      percents: { needs: 0.5, wants: 0.3, savings: 0.2 },
      phase: 'current',
      pulseRows: [
        { key: 'needs', amount: 0, amountState: 'left', progress: 0, percent: 0, tone: 'muted' },
        { key: 'wants', amount: 0, amountState: 'left', progress: 0, percent: 0, tone: 'muted' },
        {
          key: 'savings',
          amount: 160,
          amountState: 'toGoal',
          progress: 0.67,
          percent: 67,
          tone: 'muted',
        },
      ],
    });
    const reached = getCategoryOverviewItems({
      cards: [...baseCards],
      percents: { needs: 0.5, wants: 0.3, savings: 0.2 },
      phase: 'current',
      pulseRows: [
        { key: 'needs', amount: 0, amountState: 'left', progress: 0, percent: 0, tone: 'muted' },
        { key: 'wants', amount: 0, amountState: 'left', progress: 0, percent: 0, tone: 'muted' },
        {
          key: 'savings',
          amount: 480,
          amountState: 'goalReached',
          progress: 1,
          percent: 100,
          tone: 'success',
        },
      ],
    });
    const above = getCategoryOverviewItems({
      cards: [...baseCards],
      percents: { needs: 0.5, wants: 0.3, savings: 0.2 },
      phase: 'current',
      pulseRows: [
        { key: 'needs', amount: 0, amountState: 'left', progress: 0, percent: 0, tone: 'muted' },
        { key: 'wants', amount: 0, amountState: 'left', progress: 0, percent: 0, tone: 'muted' },
        {
          key: 'savings',
          amount: 20,
          amountState: 'aboveGoal',
          progress: 1,
          percent: 104,
          tone: 'success',
        },
      ],
    });

    expect(below[2]).toMatchObject({ amountKind: 'toGoal', progressTone: 'category' });
    expect(reached[2]).toMatchObject({ amountKind: 'goalReached', progressTone: 'success' });
    expect(above[2]).toMatchObject({
      amount: 20,
      amountKind: 'aboveGoal',
      progress: 1,
      progressTone: 'success',
    });
  });

  it('shows taxonomy preview in source order, not spending order', () => {
    const preview = getCategoryGroupPreview('needs');

    expect(preview.groups.map((group) => group.value)).toEqual(['rent', 'utilities', 'groceries']);
    expect(preview.moreCount).toBe(4);
  });
});
