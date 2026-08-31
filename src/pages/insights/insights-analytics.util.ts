import type { MonthDoc } from '@api/models';

export type InsightCategory = 'needs' | 'wants' | 'savings';
export type TrendDirection = 'up' | 'down' | 'flat' | 'insufficient';
export type CategoryTrendKind = 'stable' | 'trendingUp' | 'trendingDown' | 'consistent' | 'improving' | 'insufficient';
export type WatchPatternKind =
  | 'categoryOverspendTrend'
  | 'categoryVolatile'
  | 'spendingIncrease'
  | 'savingsStreak'
  | 'spendingDecrease'
  | 'stablePositive'
  | 'insufficient';

export type InsightHistoryRow = MonthDoc & { id: string };
export type UsableInsightPeriod = InsightHistoryRow & { summary: NonNullable<MonthDoc['summary']> };

export interface SpendingComparison {
  direction: TrendDirection;
  percentChange: number | null;
  latestAverage: number | null;
  previousAverage: number | null;
  comparisonSize: number;
}

export interface BudgetOutcomes {
  budgetedPeriods: number;
  trackedPeriods: number;
  under: number;
  on: number;
  over: number;
  averageUnused: number | null;
  strongestFinish: { month: string; unused: number } | null;
}

export interface CategoryPattern {
  category: InsightCategory;
  trend: CategoryTrendKind;
  latestUsage: number | null;
  pointChange: number | null;
  values: Array<{ month: string; usage: number | null }>;
}

export interface SavingsConsistency {
  validPeriods: number;
  reached: number;
  averageCompletion: number | null;
  currentStreak: number;
  sequence: Array<{ month: string; reached: boolean | null; usage: number | null }>;
}

export interface WatchPattern {
  kind: WatchPatternKind;
  category?: InsightCategory;
  percentChange?: number | null;
  fromPercent?: number | null;
  toPercent?: number | null;
  rangePercent?: number | null;
  streak?: number;
}

export interface InsightsAnalytics {
  periods: UsableInsightPeriod[];
  comparison: SpendingComparison;
  outcomes: BudgetOutcomes;
  categoryPatterns: CategoryPattern[];
  savings: SavingsConsistency;
  watch: WatchPattern;
}

const MAX_PERIODS = 6;
const CHANGE_THRESHOLD = 0.01;
const CATEGORY_TREND_THRESHOLD = 0.08;
const CATEGORY_STABLE_THRESHOLD = 0.05;
const VOLATILITY_THRESHOLD = 0.35;
const CURRENCY_EPSILON = 0.01;
const CATEGORIES: InsightCategory[] = ['needs', 'wants', 'savings'];

export function getUsableClosedInsightPeriods(
  rows: InsightHistoryRow[],
  now = new Date(),
  limit = MAX_PERIODS,
): UsableInsightPeriod[] {
  return rows
    .filter((row): row is UsableInsightPeriod => {
      if (!row.summary) return false;
      const periodEnd = new Date(row.periodEnd);
      return Number.isFinite(periodEnd.getTime()) && periodEnd <= now;
    })
    .sort((a, b) => new Date(b.periodEnd).getTime() - new Date(a.periodEnd).getTime())
    .slice(0, limit)
    .reverse();
}

export function buildInsightsAnalytics(rows: InsightHistoryRow[], now = new Date()): InsightsAnalytics {
  const periods = getUsableClosedInsightPeriods(rows, now);
  const comparison = buildSpendingComparison(periods);
  const outcomes = buildBudgetOutcomes(periods);
  const categoryPatterns = CATEGORIES.map((category) => buildCategoryPattern(periods, category));
  const savings = buildSavingsConsistency(periods);
  const watch = selectWatchPattern({ comparison, categoryPatterns, savings });

  return { periods, comparison, outcomes, categoryPatterns, savings, watch };
}

export function buildSpendingComparison(periods: UsableInsightPeriod[]): SpendingComparison {
  if (periods.length < 2) {
    return {
      direction: 'insufficient',
      percentChange: null,
      latestAverage: periods[0]?.summary.totalSpent ?? null,
      previousAverage: null,
      comparisonSize: periods.length,
    };
  }

  if (periods.length >= 6) {
    const previous = periods.slice(0, 3);
    const latest = periods.slice(-3);
    return compareAverages(previous, latest, 3);
  }

  const previous = [periods[0]];
  const latest = [periods[periods.length - 1]];
  return compareAverages(previous, latest, 1);
}

export function buildBudgetOutcomes(periods: UsableInsightPeriod[]): BudgetOutcomes {
  const budgeted = periods.filter((period) => (period.summary.income ?? 0) > CURRENCY_EPSILON);
  const tracked = budgeted.filter((period) => (period.summary.totalTxns ?? 0) > 0);
  let under = 0;
  let on = 0;
  let over = 0;
  let unusedTotal = 0;
  let strongestFinish: BudgetOutcomes['strongestFinish'] = null;

  for (const period of tracked) {
    const income = period.summary.income ?? 0;
    const spent = period.summary.totalSpent ?? 0;
    const delta = income - spent;
    const unused = Math.max(delta, 0);

    if (delta > CURRENCY_EPSILON) under += 1;
    else if (delta < -CURRENCY_EPSILON) over += 1;
    else on += 1;

    unusedTotal += unused;
    if (unused > CURRENCY_EPSILON && (!strongestFinish || unused > strongestFinish.unused)) {
      strongestFinish = { month: period.month, unused };
    }
  }

  return {
    budgetedPeriods: budgeted.length,
    trackedPeriods: tracked.length,
    under,
    on,
    over,
    averageUnused: tracked.length > 0 ? unusedTotal / tracked.length : null,
    strongestFinish,
  };
}

export function buildCategoryPattern(
  periods: UsableInsightPeriod[],
  category: InsightCategory,
): CategoryPattern {
  const values = periods.map((period) => ({
    month: period.month,
    usage: getCategoryUsage(period, category),
  }));
  const valid = values.filter((value): value is { month: string; usage: number } => value.usage != null);
  const latest = valid[valid.length - 1]?.usage ?? null;

  if (valid.length < 2 || latest == null) {
    return { category, trend: 'insufficient', latestUsage: latest, pointChange: null, values };
  }

  const first = valid[0].usage;
  const change = latest - first;
  const range = Math.max(...valid.map((v) => v.usage)) - Math.min(...valid.map((v) => v.usage));

  let trend: CategoryTrendKind;
  if (category === 'savings' && latest >= 1 && change >= 0) trend = 'consistent';
  else if (category === 'savings' && change >= CATEGORY_TREND_THRESHOLD) trend = 'improving';
  else if (change >= CATEGORY_TREND_THRESHOLD) trend = 'trendingUp';
  else if (change <= -CATEGORY_TREND_THRESHOLD) trend = 'trendingDown';
  else if (range <= CATEGORY_STABLE_THRESHOLD) trend = category === 'savings' ? 'consistent' : 'stable';
  else trend = 'stable';

  return {
    category,
    trend,
    latestUsage: latest,
    pointChange: change,
    values,
  };
}

export function buildSavingsConsistency(periods: UsableInsightPeriod[]): SavingsConsistency {
  const sequence = periods.map((period) => {
    const usage = getCategoryUsage(period, 'savings');
    return {
      month: period.month,
      usage,
      reached: usage == null ? null : usage >= 1,
    };
  });
  const valid = sequence.filter((value): value is { month: string; reached: boolean; usage: number } =>
    value.reached != null,
  );
  const reached = valid.filter((value) => value.reached).length;
  const averageCompletion =
    valid.length > 0 ? valid.reduce((sum, value) => sum + value.usage, 0) / valid.length : null;

  let currentStreak = 0;
  for (const value of [...valid].reverse()) {
    if (!value.reached) break;
    currentStreak += 1;
  }

  return {
    validPeriods: valid.length,
    reached,
    averageCompletion,
    currentStreak,
    sequence,
  };
}

export function selectWatchPattern({
  comparison,
  categoryPatterns,
  savings,
}: {
  comparison: SpendingComparison;
  categoryPatterns: CategoryPattern[];
  savings: SavingsConsistency;
}): WatchPattern {
  const needsWants = categoryPatterns.filter((pattern) => pattern.category !== 'savings');
  const overspendTrend = needsWants.find(
    (pattern) => pattern.trend === 'trendingUp' && (pattern.latestUsage ?? 0) > 1,
  );
  if (overspendTrend) {
    return {
      kind: 'categoryOverspendTrend',
      category: overspendTrend.category,
      fromPercent: firstValidUsage(overspendTrend),
      toPercent: overspendTrend.latestUsage,
    };
  }

  const volatile = [...needsWants]
    .map((pattern) => ({
      pattern,
      range: usageRange(pattern),
    }))
    .filter((item) => item.range >= VOLATILITY_THRESHOLD)
    .sort((a, b) => b.range - a.range)[0];
  if (volatile) {
    const validUsages = validCategoryUsages(volatile.pattern);
    return {
      kind: 'categoryVolatile',
      category: volatile.pattern.category,
      fromPercent: Math.min(...validUsages),
      toPercent: Math.max(...validUsages),
      rangePercent: volatile.range,
    };
  }

  if (comparison.direction === 'up' && (comparison.percentChange ?? 0) >= CHANGE_THRESHOLD) {
    return { kind: 'spendingIncrease', percentChange: comparison.percentChange };
  }

  if (savings.currentStreak >= 3) {
    return { kind: 'savingsStreak', streak: savings.currentStreak };
  }

  if (comparison.direction === 'down' && Math.abs(comparison.percentChange ?? 0) >= CHANGE_THRESHOLD) {
    return { kind: 'spendingDecrease', percentChange: comparison.percentChange };
  }

  if (categoryPatterns.some((pattern) => pattern.latestUsage != null)) {
    return { kind: 'stablePositive' };
  }

  return { kind: 'insufficient' };
}

export function formatInsightsMonth(monthKey: string, language: string) {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, (month ?? 1) - 1, 1);
  return new Intl.DateTimeFormat(language === 'ro' ? 'ro-RO' : 'en-US', {
    month: 'short',
  }).format(date);
}

export function formatCompactCurrency(value: number, formatMoney: (value: number) => string) {
  if (Math.abs(value) < 1000) return trimCurrencyCents(formatMoney(value));

  const exact = formatMoney(value);
  const compactAmount = `${trimTrailingZeros((value / 1000).toFixed(2))}k`;

  if (exact.trim().endsWith('RON')) return `${compactAmount} RON`;
  if (exact.trim().startsWith('€')) return `€${compactAmount}`;
  return compactAmount;
}

function trimTrailingZeros(value: string) {
  return value.replace(/\.?0+$/, '');
}

function trimCurrencyCents(value: string) {
  return value.replace(/\.00(?=\s?RON$|$)/, '');
}

function compareAverages(
  previous: UsableInsightPeriod[],
  latest: UsableInsightPeriod[],
  comparisonSize: number,
): SpendingComparison {
  const previousAverage = average(previous.map((period) => period.summary.totalSpent ?? 0));
  const latestAverage = average(latest.map((period) => period.summary.totalSpent ?? 0));

  if (previousAverage === 0) {
    return {
      direction: latestAverage === 0 ? 'flat' : 'up',
      percentChange: previousAverage === latestAverage ? 0 : null,
      latestAverage,
      previousAverage,
      comparisonSize,
    };
  }

  const percentChange = (latestAverage - previousAverage) / previousAverage;
  const direction =
    Math.abs(percentChange) < CHANGE_THRESHOLD ? 'flat' : percentChange > 0 ? 'up' : 'down';

  return { direction, percentChange, latestAverage, previousAverage, comparisonSize };
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getCategoryUsage(period: UsableInsightPeriod, category: InsightCategory) {
  const allocation = period.summary.allocations?.[category];
  if (!Number.isFinite(allocation) || allocation <= 0) return null;
  const spent = period.summary.spent?.[category] ?? 0;
  if (!Number.isFinite(spent)) return null;
  return spent / allocation;
}

function firstValidUsage(pattern: CategoryPattern) {
  return pattern.values.find((value) => value.usage != null)?.usage ?? null;
}

function usageRange(pattern: CategoryPattern) {
  const valid = validCategoryUsages(pattern);
  if (valid.length < 2) return 0;
  return Math.max(...valid) - Math.min(...valid);
}

function validCategoryUsages(pattern: CategoryPattern) {
  return pattern.values
    .map((value) => value.usage)
    .filter((value): value is number => value != null);
}
