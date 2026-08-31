import { Language } from '@api/types';
import { MonthDocSummary } from '@api/models';

export type HistoryCategoryKey = 'needs' | 'wants' | 'savings';
export type HistoryOutcomeTone = 'positive' | 'neutral' | 'warning' | 'danger';

export interface HistoryArchiveRow {
  id: string;
  month: string;
  income: number;
  allocations: Record<HistoryCategoryKey, number>;
  periodStart: string;
  periodEnd: string;
  summary?: MonthDocSummary;
}

export interface HistoryOutcome {
  key: string;
  vars?: Record<string, string>;
  tone: HistoryOutcomeTone;
}

export interface HistoryUsageMetric {
  category: HistoryCategoryKey;
  spent: number;
  allocated: number;
  percent: number | null;
  progress: number;
  tone: HistoryOutcomeTone;
}

const CATEGORY_KEYS: HistoryCategoryKey[] = ['needs', 'wants', 'savings'];
const MS_PER_DAY = 86_400_000;

export function clampProgress(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function safeUsagePercent(spent: number, allocated: number) {
  if (!Number.isFinite(spent) || !Number.isFinite(allocated) || allocated <= 0) return null;
  return Math.round((spent / allocated) * 100);
}

export function getHistoryBudgetTotal(summary: MonthDocSummary) {
  return CATEGORY_KEYS.reduce((sum, category) => sum + (summary.allocations?.[category] ?? 0), 0);
}

export function getHistoryOutcome(summary: MonthDocSummary, formatMoney: (value: number) => string) {
  const budgetTotal = getHistoryBudgetTotal(summary);
  const income = summary.income ?? 0;
  const spent = summary.totalSpent ?? 0;

  if (income <= 0 || budgetTotal <= 0) {
    return { key: 'outcome.noBudget', tone: 'neutral' } satisfies HistoryOutcome;
  }

  if ((summary.totalTxns ?? 0) === 0 && spent === 0) {
    return { key: 'outcome.noExpenses', tone: 'neutral' } satisfies HistoryOutcome;
  }

  const remaining = income - spent;
  if (remaining > 0) {
    return {
      key: 'outcome.leftUnused',
      vars: { amount: formatMoney(remaining) },
      tone: 'positive',
    } satisfies HistoryOutcome;
  }

  if (remaining < 0) {
    return {
      key: 'outcome.overBudget',
      vars: { amount: formatMoney(Math.abs(remaining)) },
      tone: 'danger',
    } satisfies HistoryOutcome;
  }

  return { key: 'outcome.fullyUsed', tone: 'warning' } satisfies HistoryOutcome;
}

export function getTotalUsage(summary: MonthDocSummary) {
  const income = summary.income ?? 0;
  const spent = summary.totalSpent ?? 0;
  if (!Number.isFinite(income) || income <= 0 || !Number.isFinite(spent)) {
    return { percent: null, progress: 0 };
  }

  const ratio = spent / income;
  return {
    percent: Math.round(ratio * 100),
    progress: clampProgress(ratio),
  };
}

export function buildCategoryUsage(summary: MonthDocSummary): HistoryUsageMetric[] {
  return CATEGORY_KEYS.map((category) => {
    const spent = summary.spent?.[category] ?? 0;
    const allocated = summary.allocations?.[category] ?? 0;
    const percent = safeUsagePercent(spent, allocated);
    const ratio = percent == null ? 0 : percent / 100;
    const overGoal = percent != null && percent >= 100;
    const nearCeiling = percent != null && percent >= 90;
    const tone: HistoryOutcomeTone =
      category === 'savings'
        ? overGoal
          ? 'positive'
          : 'neutral'
        : overGoal
          ? 'danger'
          : nearCeiling
            ? 'warning'
            : 'neutral';

    return {
      category,
      spent,
      allocated,
      percent,
      progress: clampProgress(ratio),
      tone,
    };
  });
}

export function formatHistoryMonthYear(monthKey: string, language: Language) {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, (month ?? 1) - 1, 1);
  return new Intl.DateTimeFormat(language === 'ro' ? 'ro-RO' : 'en-US', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatHistoryPeriodRange(periodStartISO: string, periodEndISO: string, language: string) {
  const start = new Date(periodStartISO);
  const endExclusive = new Date(periodEndISO);
  const lastDay = new Date(endExclusive.getTime() - MS_PER_DAY);
  const locale = language === 'ro' ? 'ro-RO' : 'en-US';
  const sameYear = start.getFullYear() === lastDay.getFullYear();
  const dayMonth = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' });
  const dayMonthYear = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  if (!Number.isFinite(start.getTime()) || !Number.isFinite(lastDay.getTime())) return '';

  return sameYear
    ? `${dayMonth.format(start)} - ${dayMonth.format(lastDay)}`
    : `${dayMonthYear.format(start)} - ${dayMonthYear.format(lastDay)}`;
}
