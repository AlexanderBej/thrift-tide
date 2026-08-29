import type { Insight, Txn } from '../../api/models';
import type { ExpenseGroupCard } from './budget.selectors';

import {
  buildBudgetContextSemantics,
  buildBudgetPulseRows,
  getBudgetContextAttention,
  getHeroState,
  getPeriodPhase,
  getStaleActivity,
} from './budget-context.selectors';

describe('budget context semantics', () => {
  it('treats periodEnd as exclusive when deriving the selected period phase', () => {
    const start = new Date(2026, 7, 1);
    const end = new Date(2026, 8, 1);

    expect(getPeriodPhase(start, end, new Date(2026, 7, 30, 23))).toBe('current');
    expect(getPeriodPhase(start, end, new Date(2026, 7, 31, 9))).toBe('last-day');
    expect(getPeriodPhase(start, end, new Date(2026, 8, 1, 0))).toBe('past');
    expect(getPeriodPhase(start, end, new Date(2026, 6, 31, 23))).toBe('future');
  });

  it('uses period-aware hero copy for active, over, ended, and future states', () => {
    expect(
      getHeroState({ phase: 'current', income: 2000, totalAllocated: 2000, totalSpent: 716 }),
    ).toMatchObject({ kind: 'active-remaining', amount: 1284, labelKey: 'budget:dashboard.leftThisPeriod' });

    expect(
      getHeroState({ phase: 'current', income: 2000, totalAllocated: 2000, totalSpent: 2083 }),
    ).toMatchObject({ kind: 'active-over', amount: 83, labelKey: 'budget:dashboard.overBudget' });

    expect(
      getHeroState({ phase: 'past', income: 2000, totalAllocated: 2000, totalSpent: 1700 }),
    ).toMatchObject({ kind: 'ended-unused', amount: 300, labelKey: 'budget:dashboard.leftUnused' });

    expect(
      getHeroState({ phase: 'future', income: 2000, totalAllocated: 2000, totalSpent: 0 }),
    ).toMatchObject({ kind: 'future-budgeted', amount: 2000, labelKey: 'budget:dashboard.budgeted' });
  });

  it('marks activity stale after three days without letting future-dated data create stale state', () => {
    const now = new Date(2026, 7, 29, 12);

    expect(
      getStaleActivity({
        phase: 'current',
        income: 2000,
        txns: [makeTxn({ date: '2026-08-26' })],
        now,
      }),
    ).toBe(true);

    expect(
      getStaleActivity({
        phase: 'current',
        income: 2000,
        txns: [makeTxn({ date: '2026-08-26' }), makeTxn({ date: '2026-08-30' })],
        now,
      }),
    ).toBe(false);
  });

  it('treats savings as a goal and keeps above-goal savings positive', () => {
    const rows = buildBudgetPulseRows([
      makeCard({ key: 'needs', allocated: 500, spent: 542 }),
      makeCard({ key: 'wants', allocated: 300, spent: 120 }),
      makeCard({ key: 'savings', allocated: 200, spent: 250 }),
    ]);

    expect(rows[0]).toMatchObject({ amount: 42, amountState: 'over', percent: 108, progress: 1 });
    expect(rows[1]).toMatchObject({ amount: 180, amountState: 'left', percent: 40, progress: 0.4 });
    expect(rows[2]).toMatchObject({ amount: 50, amountState: 'aboveGoal', percent: 125, progress: 1 });
  });

  it('prioritizes period and stale states ahead of ordinary smart insights', () => {
    const warningInsight: Insight = {
      id: 'pace',
      tone: 'warn',
      message: 'insights:smart.message.pace',
      ctaTarget: 'insights',
    };

    expect(
      getBudgetContextAttention(
        makeSemantics({ periodPhase: 'past', isStaleActivity: true }),
        [warningInsight],
      ).kind,
    ).toBe('past-period');

    expect(
      getBudgetContextAttention(
        makeSemantics({ periodPhase: 'future', isStaleActivity: true }),
        [warningInsight],
      ).kind,
    ).toBe('future-period');

    expect(
      getBudgetContextAttention(makeSemantics({ isNoIncome: true }), [warningInsight]).kind,
    ).toBe('no-income');

    expect(
      getBudgetContextAttention(makeSemantics({ periodPhase: 'last-day', isStaleActivity: true }), [
        warningInsight,
      ]).kind,
    ).toBe('last-day');

    expect(getBudgetContextAttention(makeSemantics({ isStaleActivity: true }), [warningInsight]).kind).toBe(
      'stale-activity',
    );

    expect(getBudgetContextAttention(makeSemantics(), [warningInsight])).toMatchObject({
      kind: 'smart-insight',
      tone: 'warn',
      insight: warningInsight,
    });
  });

  it('builds complete context semantics from selected month timing without calendar-month shortcuts', () => {
    const context = buildBudgetContextSemantics({
      selectedMonthKey: '2026-09',
      startDay: 25,
      doc: {
        month: '2026-09',
        income: 2400,
        percents: { needs: 50, wants: 30, savings: 20 },
        allocations: { needs: 1200, wants: 720, savings: 480 },
        startDay: 25,
        periodStart: new Date(2026, 7, 25).toISOString(),
        periodEnd: new Date(2026, 8, 25).toISOString(),
        createdAt: null,
        updatedAt: null,
      },
      txns: [makeTxn({ date: '2026-08-26' })],
      totals: { totalAllocated: 2400, totalSpent: 20 },
      timing: {
        periodStart: new Date(2026, 7, 25),
        periodEnd: new Date(2026, 8, 25),
        daysLeft: 27,
        daysElapsed: 4,
        totalDays: 31,
        now: new Date(2026, 7, 29),
      },
      cards: [makeCard({ key: 'needs', allocated: 1200, spent: 20 })],
      now: new Date(2026, 7, 29),
    });

    expect(context).toMatchObject({
      selectedMonthKey: '2026-09',
      currentMonthKey: '2026-09',
      nextMonthKey: '2026-10',
      periodPhase: 'current',
      isStaleActivity: true,
    });
  });
});

function makeTxn(patch: Partial<Txn>): Txn {
  return {
    id: patch.id ?? patch.date ?? 'txn',
    date: patch.date ?? '2026-08-29',
    amount: patch.amount ?? 20,
    category: patch.category ?? 'needs',
    expenseGroup: patch.expenseGroup ?? 'groceries',
    note: patch.note,
  };
}

function makeCard(patch: Partial<ExpenseGroupCard>): ExpenseGroupCard {
  const allocated = patch.allocated ?? 0;
  const spent = patch.spent ?? 0;
  return {
    key: patch.key ?? 'needs',
    title: patch.title ?? 'Needs',
    allocated,
    spent,
    remaining: Math.max(0, allocated - spent),
    progress: allocated > 0 ? Math.min(1, spent / allocated) : 0,
  };
}

function makeSemantics(
  patch: Partial<ReturnType<typeof buildBudgetContextSemantics>> = {},
): ReturnType<typeof buildBudgetContextSemantics> {
  const base = buildBudgetContextSemantics({
    selectedMonthKey: '2026-08',
    startDay: 1,
    doc: {
      month: '2026-08',
      income: 2000,
      percents: { needs: 50, wants: 30, savings: 20 },
      allocations: { needs: 1000, wants: 600, savings: 400 },
      startDay: 1,
      periodStart: new Date(2026, 7, 1).toISOString(),
      periodEnd: new Date(2026, 8, 1).toISOString(),
      createdAt: null,
      updatedAt: null,
    },
    txns: [makeTxn({ date: '2026-08-29' })],
    totals: { totalAllocated: 2000, totalSpent: 20 },
    timing: {
      periodStart: new Date(2026, 7, 1),
      periodEnd: new Date(2026, 8, 1),
      daysLeft: 3,
      daysElapsed: 28,
      totalDays: 31,
      now: new Date(2026, 7, 29),
    },
    cards: [],
    now: new Date(2026, 7, 29),
  });

  return { ...base, ...patch };
}
