import { createSelector } from '@reduxjs/toolkit';
import { addDays, differenceInCalendarDays, format, startOfDay } from 'date-fns';

import type { Insight } from '../../api/models';
import type { Category, InsightTarget, InsightTone } from '../../api/types';
import type { Txn } from '../../api/models/txn';
import type { MonthDoc } from '../../api/models/month-doc';
import {
  monthKeyFromDate,
  nextMonthKey as getNextMonthKey,
} from '../../shared/utils/period.util';
import { selectSettingsBudgetStartDay } from '../settings-store/settings.selectors';
import { selectBudgetDoc, selectBudgetMonth } from './budget.selectors.base';
import { type ExpenseGroupCard, selectCards, selectTotals, selectTxnsInPeriod } from './budget.selectors';
import { selectMonthTiming } from './budget-period.selectors';

export const STALE_ACTIVITY_DAYS = 3;

const INSIGHT_TONE_PRIORITY: InsightTone[] = ['danger', 'warn', 'info', 'success', 'muted'];
const PACE_WARN_THRESHOLD = 0.1;
const PACE_SUCCESS_THRESHOLD = 0.05;

export type BudgetPeriodPhase = 'future' | 'current' | 'last-day' | 'past';
export type BudgetContextTone = 'success' | 'warn' | 'danger' | 'info' | 'muted';
export type BudgetContextAction =
  | 'none'
  | 'open-income'
  | 'go-current-period'
  | 'prepare-next-period'
  | 'add-expenses'
  | 'view-insights';
export type BudgetContextKind =
  | 'past-period'
  | 'future-period'
  | 'no-income'
  | 'last-day'
  | 'stale-activity'
  | 'smart-insight'
  | 'quiet';
export type BudgetHeroKind =
  | 'setup'
  | 'active-remaining'
  | 'active-over'
  | 'ended-unused'
  | 'ended-over'
  | 'future-budgeted';
export type BudgetPulseAmountState = 'left' | 'over' | 'toGoal' | 'goalReached' | 'aboveGoal';
export type SavingsGoalState = 'no-goal' | 'to-goal' | 'goal-reached' | 'above-goal';

export interface BudgetHeroState {
  kind: BudgetHeroKind;
  amount: number;
  labelKey: string;
  tone: BudgetContextTone;
}

export interface BudgetPeriodStatus {
  labelKey: string;
  tone: BudgetContextTone;
  vars?: Record<string, number | string>;
}

export interface BudgetPulseSemanticRow {
  key: Category;
  amount: number;
  amountState: BudgetPulseAmountState;
  progress: number;
  percent: number;
  tone: BudgetContextTone;
}

export interface BudgetContextSemantics {
  selectedMonthKey: string;
  currentMonthKey: string;
  nextMonthKey: string;
  periodStart: Date;
  periodEnd: Date;
  periodLastDay: Date;
  periodPhase: BudgetPeriodPhase;
  isNoIncome: boolean;
  isOverBudget: boolean;
  isStaleActivity: boolean;
  lastTxnDate: Date | null;
  hero: BudgetHeroState;
  periodStatus: BudgetPeriodStatus;
  pulseRows: BudgetPulseSemanticRow[];
}

export interface BudgetContextAttention {
  kind: BudgetContextKind;
  tone: BudgetContextTone;
  titleKey?: string;
  messageKey?: string;
  ctaLabelKey?: string;
  action: BudgetContextAction;
  illustration: BudgetContextTone | 'period' | 'start-day';
  insight?: Insight;
  insightPath?: string | null;
}

export function toBudgetDay(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

export function ymdToLocalDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function getPeriodPhase(periodStart: Date, periodEnd: Date, now = new Date()): BudgetPeriodPhase {
  const startKey = toBudgetDay(startOfDay(periodStart));
  const lastDay = addDays(startOfDay(periodEnd), -1);
  const lastDayKey = toBudgetDay(lastDay);
  const nowKey = toBudgetDay(startOfDay(now));

  if (nowKey < startKey) return 'future';
  if (nowKey > lastDayKey) return 'past';
  if (nowKey === lastDayKey) return 'last-day';
  return 'current';
}

export function getMostRecentTxnDate(txns: Txn[]): Date | null {
  if (txns.length === 0) return null;

  return txns.reduce<Date | null>((latest, txn) => {
    const txnDate = ymdToLocalDate(txn.date);
    if (!latest || txnDate > latest) return txnDate;
    return latest;
  }, null);
}

export function getStaleActivity({
  phase,
  income,
  txns,
  now = new Date(),
  thresholdDays = STALE_ACTIVITY_DAYS,
}: {
  phase: BudgetPeriodPhase;
  income: number;
  txns: Txn[];
  now?: Date;
  thresholdDays?: number;
}) {
  if (phase !== 'current' || income <= 0 || txns.length === 0) return false;

  const latest = getMostRecentTxnDate(txns);
  if (!latest || latest > startOfDay(now)) return false;

  return differenceInCalendarDays(startOfDay(now), latest) >= thresholdDays;
}

export function getHeroState({
  phase,
  income,
  totalAllocated,
  totalSpent,
}: {
  phase: BudgetPeriodPhase;
  income: number;
  totalAllocated: number;
  totalSpent: number;
}): BudgetHeroState {
  if (income <= 0) {
    return { kind: 'setup', amount: 0, labelKey: 'budget:dashboard.noIncomeTitle', tone: 'muted' };
  }

  const rawRemaining = totalAllocated - totalSpent;
  if (phase === 'future') {
    return {
      kind: 'future-budgeted',
      amount: totalAllocated,
      labelKey: 'budget:dashboard.budgeted',
      tone: 'muted',
    };
  }

  if (rawRemaining < 0) {
    return {
      kind: phase === 'past' ? 'ended-over' : 'active-over',
      amount: Math.abs(rawRemaining),
      labelKey: 'budget:dashboard.overBudget',
      tone: 'danger',
    };
  }

  return {
    kind: phase === 'past' ? 'ended-unused' : 'active-remaining',
    amount: rawRemaining,
    labelKey: phase === 'past' ? 'budget:dashboard.leftUnused' : 'budget:dashboard.leftThisPeriod',
    tone: phase === 'past' ? 'muted' : 'success',
  };
}

export function getPeriodStatus({
  phase,
  daysLeft,
  burn,
  pace,
}: {
  phase: BudgetPeriodPhase;
  daysLeft: number;
  burn: number | null;
  pace: number | null;
}): BudgetPeriodStatus {
  if (phase === 'future') return { labelKey: 'budget:dashboard.status.future', tone: 'muted' };
  if (phase === 'past') return { labelKey: 'budget:dashboard.status.ended', tone: 'muted' };
  if (phase === 'last-day') return { labelKey: 'budget:dashboard.status.lastDay', tone: 'info' };

  if (burn != null && pace != null && burn > pace + PACE_WARN_THRESHOLD) {
    return { labelKey: 'budget:dashboard.status.faster', tone: 'warn', vars: { days: daysLeft } };
  }

  return { labelKey: 'budget:dashboard.status.onTrack', tone: 'success', vars: { days: daysLeft } };
}

export function getBudgetHealth({
  phase,
  isNoIncome,
  isOverBudget,
  burn,
  pace,
}: {
  phase: BudgetPeriodPhase;
  isNoIncome: boolean;
  isOverBudget: boolean;
  burn: number | null;
  pace: number | null;
}): BudgetContextTone {
  if (isNoIncome || phase === 'future' || phase === 'past') return 'muted';
  if (isOverBudget) return 'danger';
  if (burn != null && pace != null) {
    if (burn > pace + PACE_WARN_THRESHOLD) return 'warn';
    if (burn < pace - PACE_SUCCESS_THRESHOLD) return 'success';
  }
  return 'success';
}

export function getSavingsGoalState(allocated: number, spent: number): {
  state: SavingsGoalState;
  amount: number;
} {
  if (allocated <= 0) return { state: 'no-goal', amount: spent };
  if (spent < allocated) return { state: 'to-goal', amount: allocated - spent };
  if (spent === allocated) return { state: 'goal-reached', amount: spent };
  return { state: 'above-goal', amount: spent - allocated };
}

export function buildBudgetPulseRows(cards: ExpenseGroupCard[]): BudgetPulseSemanticRow[] {
  return cards.map((card) => {
    const ratio = card.allocated > 0 ? card.spent / card.allocated : 0;
    const progress = Math.min(1, Math.max(0, ratio));
    const percent = card.allocated > 0 ? Math.round(ratio * 100) : 0;

    if (card.key === 'savings') {
      const savings = getSavingsGoalState(card.allocated, card.spent);
      if (savings.state === 'above-goal') {
        return {
          key: card.key,
          amount: savings.amount,
          amountState: 'aboveGoal',
          progress,
          percent,
          tone: 'success',
        };
      }
      if (savings.state === 'goal-reached') {
        return {
          key: card.key,
          amount: savings.amount,
          amountState: 'goalReached',
          progress,
          percent,
          tone: 'success',
        };
      }
      return {
        key: card.key,
        amount: savings.amount,
        amountState: 'toGoal',
        progress,
        percent,
        tone: 'muted',
      };
    }

    const rawRemaining = card.allocated - card.spent;
    const over = rawRemaining < 0;
    return {
      key: card.key,
      amount: over ? Math.abs(rawRemaining) : rawRemaining,
      amountState: over ? 'over' : 'left',
      progress,
      percent,
      tone: over ? 'danger' : 'muted',
    };
  });
}

export function getPrioritizedInsight(insights: Insight[]): Insight | undefined {
  for (const tone of INSIGHT_TONE_PRIORITY) {
    const match = insights.find((insight) => insight.tone === tone);
    if (match) return match;
  }
  return insights[0];
}

export function getBudgetContextAttention(
  semantics: BudgetContextSemantics,
  insights: Insight[],
): BudgetContextAttention {
  if (semantics.periodPhase === 'past') {
    return {
      kind: 'past-period',
      tone: semantics.hero.tone,
      titleKey: 'budget:dashboard.context.periodEnded.title',
      messageKey: 'budget:dashboard.context.periodEnded.message',
      ctaLabelKey:
        semantics.selectedMonthKey === semantics.currentMonthKey
          ? 'budget:dashboard.context.periodEnded.nextCta'
          : 'budget:dashboard.context.periodEnded.cta',
      action:
        semantics.selectedMonthKey === semantics.currentMonthKey
          ? 'prepare-next-period'
          : 'go-current-period',
      illustration: 'period',
    };
  }

  if (semantics.periodPhase === 'future') {
    return {
      kind: 'future-period',
      tone: 'muted',
      titleKey: 'budget:dashboard.context.futurePeriod.title',
      messageKey: 'budget:dashboard.context.futurePeriod.message',
      ctaLabelKey: 'budget:dashboard.context.futurePeriod.cta',
      action: 'go-current-period',
      illustration: 'period',
    };
  }

  if (semantics.isNoIncome) {
    return {
      kind: 'no-income',
      tone: 'info',
      titleKey: 'budget:dashboard.context.noIncome.title',
      messageKey: 'budget:dashboard.context.noIncome.message',
      ctaLabelKey: 'budget:dashboard.context.noIncome.cta',
      action: 'open-income',
      illustration: 'start-day',
    };
  }

  if (semantics.periodPhase === 'last-day') {
    return {
      kind: 'last-day',
      tone: 'info',
      titleKey: 'budget:dashboard.context.lastDay.title',
      messageKey: 'budget:dashboard.context.lastDay.message',
      ctaLabelKey: 'budget:dashboard.context.lastDay.cta',
      action: 'prepare-next-period',
      illustration: 'period',
    };
  }

  if (semantics.isStaleActivity) {
    return {
      kind: 'stale-activity',
      tone: 'warn',
      titleKey: 'budget:dashboard.context.stale.title',
      messageKey: 'budget:dashboard.context.stale.message',
      ctaLabelKey: 'budget:dashboard.context.stale.cta',
      action: 'add-expenses',
      illustration: 'warn',
    };
  }

  const insight = getPrioritizedInsight(insights);
  if (insight) {
    return {
      kind: 'smart-insight',
      tone: insight.tone,
      action: insight.id === 'fresh_start' || insight.id === 'no_spend_late' ? 'add-expenses' : 'view-insights',
      illustration: insight.tone,
      insight,
      insightPath: getInsightActionPath(insight),
    };
  }

  return {
    kind: 'quiet',
    tone: 'success',
    titleKey: 'budget:dashboard.context.quiet.title',
    messageKey: 'budget:dashboard.context.quiet.message',
    ctaLabelKey: 'budget:dashboard.context.quiet.cta',
    action: 'view-insights',
    illustration: 'success',
  };
}

export function getInsightActionPath(insight: Insight | undefined): string | null {
  if (!insight) return null;
  if (insight.id === 'fresh_start' || insight.id === 'no_spend_late') return '/transactions/new';
  if (!insight.ctaTarget) return null;
  return toPathFromInsightTarget(insight.ctaTarget);
}

export function buildBudgetContextSemantics({
  selectedMonthKey,
  startDay,
  doc,
  txns,
  totals,
  timing,
  cards,
  now = timing.now,
}: {
  selectedMonthKey: string;
  startDay: number;
  doc: MonthDoc | null;
  txns: Txn[];
  totals: {
    totalAllocated: number;
    totalSpent: number;
  };
  timing: {
    periodStart: Date;
    periodEnd: Date;
    daysLeft: number;
    totalDays: number;
    daysElapsed: number;
    now: Date;
  };
  cards: ExpenseGroupCard[];
  now?: Date;
}): BudgetContextSemantics {
  const periodPhase = getPeriodPhase(timing.periodStart, timing.periodEnd, now);
  const income = doc?.income ?? 0;
  const isNoIncome = income <= 0;
  const isOverBudget = totals.totalSpent > totals.totalAllocated;
  const burn = totals.totalAllocated > 0 ? totals.totalSpent / totals.totalAllocated : null;
  const pace = timing.totalDays > 0 ? timing.daysElapsed / timing.totalDays : null;
  const currentMonthKey = monthKeyFromDate(now, startDay);
  const periodLastDay = addDays(startOfDay(timing.periodEnd), -1);

  return {
    selectedMonthKey,
    currentMonthKey,
    nextMonthKey: getNextMonthKey(selectedMonthKey, startDay),
    periodStart: timing.periodStart,
    periodEnd: timing.periodEnd,
    periodLastDay,
    periodPhase,
    isNoIncome,
    isOverBudget,
    isStaleActivity: getStaleActivity({ phase: periodPhase, income, txns, now }),
    lastTxnDate: getMostRecentTxnDate(txns),
    hero: getHeroState({
      phase: periodPhase,
      income,
      totalAllocated: totals.totalAllocated,
      totalSpent: totals.totalSpent,
    }),
    periodStatus: getPeriodStatus({ phase: periodPhase, daysLeft: timing.daysLeft, burn, pace }),
    pulseRows: buildBudgetPulseRows(cards),
  };
}

export const selectBudgetContextSemantics = createSelector(
  [
    selectBudgetMonth,
    selectSettingsBudgetStartDay,
    selectBudgetDoc,
    selectTxnsInPeriod,
    selectTotals,
    selectMonthTiming,
    selectCards,
  ],
  (selectedMonthKey, startDay, doc, txns, totals, timing, cards) =>
    buildBudgetContextSemantics({
      selectedMonthKey,
      startDay,
      doc,
      txns,
      totals,
      timing,
      cards,
    }),
);

function toPathFromInsightTarget(target: InsightTarget): string {
  if (target === 'insights') return '/insights';
  if (target === 'transactions') return '/transactions';
  if (target === 'categories') return '/categories';
  if (target.startsWith('category:') || target.startsWith('categories:')) {
    return `/categories/${target.split(':')[1]}`;
  }
  return '/';
}
