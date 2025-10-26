import { createSelector } from '@reduxjs/toolkit';
import { selectTotals, selectBurnVsPace, selectMonthTiming } from './budget-insights.selectors';
import type { Bucket } from '../../api/types/bucket.types';

export type BadgeKind = 'danger' | 'warn' | 'info' | 'success';
export type Badge = { id: string; text: string; kind: BadgeKind; scope?: 'total' | Bucket };

const OVERPACE = 0.1; // 10 pp buffer
const HIGH_OVERPACE = 0.15;
const NEAR = 0.05; // ±5 pp ~ “near”

export const selectBadges = createSelector(
  [selectTotals, selectBurnVsPace, selectMonthTiming],
  (tot, bvp, t): Badge[] => {
    const badges: Badge[] = [];
    const { burn, pace } = bvp;

    // Guard: early month or no allocations
    if (pace == null || tot.totalAllocated <= 0) return badges;

    // --- Wants over budget
    if (tot.alloc.wants > 0) {
      const bw = bvp.burn.wants ?? 0;
      if (tot.spent.wants >= tot.alloc.wants || bw > pace + OVERPACE) {
        badges.push({
          id: 'wants-over',
          text: 'Wants over budget',
          kind: 'danger',
          scope: 'wants',
        });
      }
    }

    // --- Needs near budget
    if (tot.alloc.needs > 0) {
      const remainingFrac = tot.remaining.needs / tot.alloc.needs;
      const bn = burn.needs ?? 0;
      if (remainingFrac <= 0.1 || Math.abs(bn - 1) <= NEAR) {
        badges.push({ id: 'needs-near', text: 'Needs near budget', kind: 'warn', scope: 'needs' });
      }
    }

    // --- High burn rate (overall)
    if ((burn.total ?? 0) > pace + HIGH_OVERPACE) {
      badges.push({ id: 'high-burn', text: 'High burn rate', kind: 'danger', scope: 'total' });
    }

    // --- Savings behind plan (optional but helpful)
    if (tot.alloc.savings > 0 && burn.savings != null && burn.savings < pace - OVERPACE) {
      badges.push({
        id: 'save-behind',
        text: 'Savings behind plan',
        kind: 'info',
        scope: 'savings',
      });
    }

    // --- Under pace (overall good)
    if (burn.total != null && burn.total < pace - OVERPACE) {
      badges.push({ id: 'under-pace', text: 'Under pace (good)', kind: 'success', scope: 'total' });
    }

    // Keep it tidy
    return badges.slice(0, 4);
  },
);

// Per-bucket badges
export const makeSelectBucketBadges = (bucket: Bucket) =>
  createSelector([selectTotals, selectBurnVsPace, selectMonthTiming], (tot, bvp, t): Badge[] => {
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
