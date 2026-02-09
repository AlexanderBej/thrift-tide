import { createSelector } from '@reduxjs/toolkit';
import { addDays, eachDayOfInterval, format } from 'date-fns';

import { Category } from '@api/types';
import { toYMDUTC } from '@shared/utils';
import { selectBudgetTxns } from './budget.selectors.base';
import { selectTxnsInPeriod } from './budget.selectors';
import { selectMonthTiming } from './budget-period.selectors';

const isYmd = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);

/** Accepts Date or string-like input */
function keyFromInput(date: Date | string): string {
  if (typeof date === 'string' && isYmd(date)) return date;
  return toYMDUTC(date);
}

type DailyCategoryTotals = {
  total: number;
  needs: number;
  wants: number;
  savings: number;
};

export const makeSelectCategoryDailySeriesNivo = (cat: Category) =>
  createSelector([selectTxnsInPeriod, selectMonthTiming], (txns, t) => {
    const lastInclusive = addDays(t.periodEnd, -1);
    const days = eachDayOfInterval({ start: t.periodStart, end: lastInclusive });

    // Sum per day for this category
    const byDay: Record<string, number> = {};
    for (const x of txns) {
      if (x.type !== cat) continue;
      const key = keyFromInput(x.date);
      byDay[key] = (byDay[key] ?? 0) + Math.max(0, x.amount);
    }

    const data = days.map((d) => {
      const key = format(d, 'yyyy-MM-dd');
      const dayLabel = format(d, 'd'); // show 1..31 on axis
      return { x: dayLabel, y: byDay[key] ?? 0 };
    });

    return [{ id: 'Daily', data }];
  });

/** Map<"YYYY-MM-DD", { total, needs, wants, savings }> */
export const selectDailySpendMap = createSelector(
  [selectBudgetTxns],
  (txns): Map<string, DailyCategoryTotals> => {
    const map = new Map<string, DailyCategoryTotals>();
    for (const tx of txns) {
      // Adjust field names if needed: tx.date, tx.amount, tx.type: Category
      const key = keyFromInput(tx.date as any);
      const amt = Math.max(0, Number(tx.amount) || 0);

      // If you store incomes/transfers among txns, skip them here
      // if (tx.kind !== 'expense') continue;

      const rec = map.get(key) ?? { total: 0, needs: 0, wants: 0, savings: 0 };
      rec.total += amt;
      if (tx.type === 'needs' || tx.type === 'wants' || tx.type === 'savings') {
        (rec as any)[tx.type] += amt;
      }
      map.set(key, rec);
    }
    return map;
  },
);

export const selectDailySpendQuery = createSelector(
  [selectDailySpendMap],
  (map) =>
    (date: Date | string, category?: Category): number => {
      const rec = map.get(keyFromInput(date));
      if (!rec) return 0;
      return category ? rec[category] : rec.total;
    },
);
