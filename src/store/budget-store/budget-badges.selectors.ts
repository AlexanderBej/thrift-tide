import { createSelector } from '@reduxjs/toolkit';
import type { Bucket } from '../../api/types/bucket.types';
import { selectTotals } from './budget.selectors';
import { selectBurnVsPace } from './budget-insights.selectors';
import { selectMonthTiming } from './budget-period.selectors';
import { Badge } from '../../api/models/badges';

const OVERPACE = 0.1;
const HIGH_OVERPACE = 0.15;
const NEAR = 0.05;

/** Top-level dashboard badge set (max 4), highlighting overspend/near/under-pace patterns. */
export const selectBadges = createSelector(
  [selectTotals, selectBurnVsPace, selectMonthTiming],
  (tot, bvp): Badge[] => {
    const badges: Badge[] = [];
    const { burn, pace } = bvp;
    if (pace == null || tot.totalAllocated <= 0) return badges;

    if (tot.alloc.wants > 0) {
      const bw = burn.wants ?? 0;
      if (tot.spent.wants >= tot.alloc.wants || bw > pace + OVERPACE) {
        badges.push({
          id: 'wants-over',
          text: 'Wants over budget',
          kind: 'danger',
          scope: 'wants',
        });
      }
    }

    if (tot.alloc.needs > 0) {
      const remainingFrac = tot.remaining.needs / tot.alloc.needs;
      const bn = burn.needs ?? 0;
      if (remainingFrac <= 0.1 || Math.abs(bn - 1) <= NEAR) {
        badges.push({ id: 'needs-near', text: 'Needs near budget', kind: 'warn', scope: 'needs' });
      }
    }

    if ((burn.total ?? 0) > pace + HIGH_OVERPACE) {
      badges.push({ id: 'high-burn', text: 'High burn rate', kind: 'danger', scope: 'total' });
    }

    if (tot.alloc.savings > 0 && burn.savings != null && burn.savings < pace - OVERPACE) {
      badges.push({
        id: 'save-behind',
        text: 'Savings behind plan',
        kind: 'info',
        scope: 'savings',
      });
    }

    if (burn.total != null && burn.total < pace - OVERPACE) {
      badges.push({ id: 'under-pace', text: 'Under pace (good)', kind: 'success', scope: 'total' });
    }

    return badges.slice(0, 4);
  },
);

/** Bucket-specific badge set for the category page header. */
export const makeSelectBucketBadges = (bucket: Bucket) =>
  createSelector([selectTotals, selectBurnVsPace, selectMonthTiming], (tot, bvp): Badge[] => {
    const list: Badge[] = [];
    const alloc = tot.alloc[bucket];
    if (alloc <= 0) return list;

    const spent = tot.spent[bucket];
    const rem = tot.remaining[bucket];
    const b = bvp.burn[bucket];
    const pace = bvp.pace ?? 0;

    if (spent >= alloc || (b != null && b > pace + OVERPACE)) {
      list.push({ id: `${bucket}-over`, text: 'Over budget', kind: 'danger', scope: bucket });
    } else if (Math.abs((b ?? 0) - 1) <= NEAR || rem / alloc <= 0.1) {
      list.push({ id: `${bucket}-near`, text: 'Near budget', kind: 'warn', scope: bucket });
    } else if (b != null && b < pace - OVERPACE) {
      list.push({ id: `${bucket}-under`, text: 'Under pace', kind: 'success', scope: bucket });
    }
    return list;
  });
