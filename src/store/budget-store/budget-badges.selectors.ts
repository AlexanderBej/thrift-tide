import { createSelector } from '@reduxjs/toolkit';

import { selectTotals } from './budget.selectors';
import { selectBurnVsPace } from './budget-insights.selectors';
import { selectMonthTiming } from './budget-period.selectors';
import { Badge } from '@api/models';
import { Category } from '@api/types';

const OVERPACE = 0.1;
const NEAR = 0.05;

/** Category-specific badge set for the expense group page header. */
export const makeSelectCategoryBadges = (cat: Category) =>
  createSelector([selectTotals, selectBurnVsPace, selectMonthTiming], (tot, bvp): Badge[] => {
    const list: Badge[] = [];
    const alloc = tot.alloc[cat];
    if (alloc <= 0) return list;

    const spent = tot.spent[cat];
    const rem = tot.remaining[cat];
    const b = bvp.burn[cat];
    const pace = bvp.pace ?? 0;

    if (spent >= alloc || (b != null && b > pace + OVERPACE)) {
      list.push({
        id: `${cat}-over`,
        i18nKey: 'budget:badges.overBudget',
        kind: 'danger',
        scope: cat,
      });
    } else if (Math.abs((b ?? 0) - 1) <= NEAR || rem / alloc <= 0.1) {
      list.push({
        id: `${cat}-near`,
        i18nKey: 'budget:badges.nearBudget',
        kind: 'warn',
        scope: cat,
      });
    } else if (b != null && b < pace - OVERPACE) {
      if (cat === 'savings')
        list.push({
          id: `${cat}-under`,
          i18nKey: 'budget:badges.behindPlan',
          kind: 'warn',
          scope: cat,
        });
      else
        list.push({
          id: `${cat}-under`,
          i18nKey: 'budget:badges.underPace',
          kind: 'success',
          scope: cat,
        });
    }
    return list;
  });
