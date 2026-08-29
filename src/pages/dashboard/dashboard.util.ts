import { format, isSameDay, subDays } from 'date-fns';

import type { Insight } from '../../api/models';
import type { InsightTarget } from '../../api/types';
import type { Txn } from '../../api/models/txn';

export interface DashboardRecentActivityItem {
  id: string;
  title: string;
  expenseGroup: string;
  amount: number;
  date: string;
  dateLabelKey?: string;
  dateFallback?: string;
}

function dayFromYmd(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function getDashboardInsightPath(insight: Insight | undefined): string | null {
  if (!insight) return null;
  if (insight.id === 'fresh_start' || insight.id === 'no_spend_late') return '/transactions/new';
  if (!insight.ctaTarget) return null;
  return toPathFromInsightTarget(insight.ctaTarget);
}

export function buildRecentActivity(
  txns: Txn[],
  getExpenseGroupLabel: (expenseGroup: string) => string,
  now = new Date(),
  limit = 3,
): DashboardRecentActivityItem[] {
  return [...txns]
    .sort((a, b) => b.date.localeCompare(a.date) || b.amount - a.amount)
    .slice(0, limit)
    .map((txn, index) => {
      const expenseGroup = getExpenseGroupLabel(txn.expenseGroup);
      const txnDate = dayFromYmd(txn.date);
      const title = txn.note?.trim() || expenseGroup;
      const relative = getRelativeDateLabel(txnDate, now);

      return {
        id: txn.id ?? `${txn.date}-${txn.expenseGroup}-${index}`,
        title,
        expenseGroup,
        amount: txn.amount,
        date: txn.date,
        dateLabelKey: relative,
        dateFallback: relative ? undefined : format(txnDate, 'd MMM'),
      };
    });
}

function getRelativeDateLabel(date: Date, now: Date) {
  if (isSameDay(date, now)) return 'common:dates.today';
  if (isSameDay(date, subDays(now, 1))) return 'common:dates.yesterday';
  return undefined;
}

function toPathFromInsightTarget(target: InsightTarget): string {
  if (target === 'insights') return '/insights';
  if (target === 'transactions') return '/transactions';
  if (target === 'categories') return '/categories';
  if (target.startsWith('category:') || target.startsWith('categories:')) {
    return `/categories/${target.split(':')[1]}`;
  }
  return '/';
}
