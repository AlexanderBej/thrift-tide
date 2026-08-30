import type { Category, PercentTriple } from '@api/types';
import type {
  BudgetPeriodPhase,
  BudgetPulseAmountState,
  BudgetPulseSemanticRow,
  ExpenseGroupCard,
} from '@store/budget-store';
import { getExpGroupsByType, resolveExpenseGroup } from '@shared/utils/expense-group-options.util';
import type { ExpenseGroupOption } from '@api/models';

export const CATEGORY_DETAIL_CATEGORIES: Category[] = ['needs', 'wants', 'savings'];

export type CategoryDetailStatusKind =
  | 'left'
  | 'unused'
  | 'over'
  | 'toGoal'
  | 'goalReached'
  | 'aboveGoal'
  | 'noBudget';

export interface CategoryDetailGroupRow {
  group: ExpenseGroupOption;
  total: number;
  compositionPercent: number | null;
  active: boolean;
}

export interface CategoryDetailSummary {
  category: Category;
  percent: number;
  allocated: number;
  actual: number;
  amount: number;
  statusKind: CategoryDetailStatusKind;
  progress: number;
  progressTone: 'category' | 'danger' | 'success' | 'muted';
  periodPhase: BudgetPeriodPhase;
  isNoBudget: boolean;
}

export function isCategoryDetailCategory(value: string | undefined): value is Category {
  return CATEGORY_DETAIL_CATEGORIES.includes(value as Category);
}

export function buildCategoryDetailSummary({
  category,
  percents,
  card,
  pulseRow,
  periodPhase,
}: {
  category: Category;
  percents?: PercentTriple;
  card?: ExpenseGroupCard;
  pulseRow?: BudgetPulseSemanticRow;
  periodPhase: BudgetPeriodPhase;
}): CategoryDetailSummary {
  const allocated = card?.allocated ?? 0;
  const actual = card?.spent ?? 0;
  const isNoBudget = allocated <= 0;
  const statusKind = isNoBudget
    ? 'noBudget'
    : getStatusKind(category, periodPhase, pulseRow?.amountState);
  const fallbackAmount = Math.max(0, allocated - actual);
  const amount = pulseRow?.amount ?? (statusKind === 'over' ? Math.max(0, actual - allocated) : fallbackAmount);
  const rawProgress = pulseRow?.progress ?? card?.progress ?? 0;
  const progress = Math.min(1, Math.max(0, rawProgress));

  return {
    category,
    percent: normalizePercent(percents?.[category]),
    allocated,
    actual,
    amount,
    statusKind,
    progress,
    progressTone: getProgressTone(category, statusKind),
    periodPhase,
    isNoBudget,
  };
}

export function buildCategoryDetailGroups({
  category,
  byExpGroup,
  categoryActual,
}: {
  category: Category;
  byExpGroup: Array<{ expGroup: string; total: number }>;
  categoryActual: number;
}): CategoryDetailGroupRow[] {
  const taxonomyGroups = getExpGroupsByType(category);
  const taxonomyOrder = new Map(taxonomyGroups.map((group, index) => [group.value, index]));
  const totalsByValue = new Map(taxonomyGroups.map((group) => [group.value, 0]));

  for (const row of byExpGroup) {
    const resolved = resolveExpenseGroup(row.expGroup);
    if (!totalsByValue.has(resolved.value)) continue;
    totalsByValue.set(resolved.value, (totalsByValue.get(resolved.value) ?? 0) + Math.max(0, row.total));
  }

  const denominator = Math.max(0, categoryActual);

  return taxonomyGroups
    .map((group) => {
      const total = totalsByValue.get(group.value) ?? 0;
      const active = total > 0;
      return {
        group,
        total,
        active,
        compositionPercent: active && denominator > 0 ? Math.min(100, Math.round((total / denominator) * 100)) : null,
      };
    })
    .sort((a, b) => {
      if (a.active && b.active) {
        return b.total - a.total || (taxonomyOrder.get(a.group.value) ?? 0) - (taxonomyOrder.get(b.group.value) ?? 0);
      }
      if (a.active) return -1;
      if (b.active) return 1;
      return (taxonomyOrder.get(a.group.value) ?? 0) - (taxonomyOrder.get(b.group.value) ?? 0);
    });
}

function normalizePercent(value: number | undefined): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round((value ?? 0) * 100)));
}

function getStatusKind(
  category: Category,
  periodPhase: BudgetPeriodPhase,
  amountState?: BudgetPulseAmountState,
): CategoryDetailStatusKind {
  if (category === 'savings') {
    if (amountState === 'aboveGoal') return 'aboveGoal';
    if (amountState === 'goalReached') return 'goalReached';
    return 'toGoal';
  }

  if (amountState === 'over') return 'over';
  return periodPhase === 'past' ? 'unused' : 'left';
}

function getProgressTone(
  category: Category,
  statusKind: CategoryDetailStatusKind,
): CategoryDetailSummary['progressTone'] {
  if (statusKind === 'noBudget') return 'muted';
  if (category === 'savings' && (statusKind === 'goalReached' || statusKind === 'aboveGoal')) {
    return 'success';
  }
  if (statusKind === 'over') return 'danger';
  return 'category';
}
