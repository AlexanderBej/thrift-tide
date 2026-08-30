import type { Category } from '@api/types';
import type {
  BudgetPeriodPhase,
  BudgetPulseAmountState,
  BudgetPulseSemanticRow,
  ExpenseGroupCard,
} from '@store/budget-store';
import type { PercentTriple } from '@api/types';
import {
  EXPENSE_GROUP_OPTIONS,
  ResolvedExpenseGroupOption,
  getExpGroupsByType,
} from '@shared/utils/expense-group-options.util';

export type CategoryOverviewAmountKind =
  | 'left'
  | 'unused'
  | 'over'
  | 'toGoal'
  | 'goalReached'
  | 'aboveGoal';

export interface CategoryOverviewItem {
  key: Category;
  percent: number;
  allocated: number;
  spent: number;
  amount: number;
  amountKind: CategoryOverviewAmountKind;
  progress: number;
  progressTone: 'category' | 'danger' | 'success';
  groups: ResolvedExpenseGroupOption[];
  moreCount: number;
}

const ORDER: Category[] = ['needs', 'wants', 'savings'];

export function normalizePercent(value: number | undefined): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round((value ?? 0) * 100)));
}

export function getAllocationSegments(percents?: PercentTriple) {
  return ORDER.map((key) => ({
    key,
    percent: normalizePercent(percents?.[key]),
  }));
}

export function getCategoryGroupPreview(category: Category, visibleCount = 3) {
  const groups = getExpGroupsByType(category).map((group) => ({ ...group, category }));
  return {
    groups: groups.slice(0, visibleCount),
    moreCount: Math.max(0, groups.length - visibleCount),
  };
}

export function getCategoryOverviewItems({
  cards,
  pulseRows,
  percents,
  phase,
}: {
  cards: ExpenseGroupCard[];
  pulseRows: BudgetPulseSemanticRow[];
  percents?: PercentTriple;
  phase: BudgetPeriodPhase;
}): CategoryOverviewItem[] {
  const cardsByKey = new Map(cards.map((card) => [card.key, card]));
  const pulseByKey = new Map(pulseRows.map((row) => [row.key, row]));

  return ORDER.map((key) => {
    const card = cardsByKey.get(key);
    const pulse = pulseByKey.get(key);
    const { groups, moreCount } = getCategoryGroupPreview(key);
    const amountKind = getAmountKind(key, phase, pulse?.amountState);

    return {
      key,
      percent: normalizePercent(percents?.[key]),
      allocated: card?.allocated ?? 0,
      spent: card?.spent ?? 0,
      amount: pulse?.amount ?? 0,
      amountKind,
      progress: Math.min(1, Math.max(0, pulse?.progress ?? 0)),
      progressTone: getProgressTone(key, amountKind),
      groups,
      moreCount,
    };
  });
}

export function getTaxonomyGroupCount(category: Category) {
  return EXPENSE_GROUP_OPTIONS[category].length;
}

function getAmountKind(
  category: Category,
  phase: BudgetPeriodPhase,
  amountState?: BudgetPulseAmountState,
): CategoryOverviewAmountKind {
  if (category === 'savings') {
    if (amountState === 'aboveGoal') return 'aboveGoal';
    if (amountState === 'goalReached') return 'goalReached';
    return 'toGoal';
  }

  if (amountState === 'over') return 'over';
  return phase === 'past' ? 'unused' : 'left';
}

function getProgressTone(
  category: Category,
  amountKind: CategoryOverviewAmountKind,
): CategoryOverviewItem['progressTone'] {
  if (category === 'savings' && (amountKind === 'goalReached' || amountKind === 'aboveGoal')) {
    return 'success';
  }

  if (amountKind === 'over') return 'danger';
  return 'category';
}
