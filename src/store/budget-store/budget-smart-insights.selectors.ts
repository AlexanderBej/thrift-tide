import { createSelector } from '@reduxjs/toolkit';

import { toPctInt } from '@shared/utils';
import { selectDashboardInsights } from './budget-insights.selectors';
import { selectMonthTiming } from './budget-period.selectors';
import { selectTotals } from './budget.selectors';
import { Insight } from '@api/models/insight';

// Tune these once and reuse
const THRESH = {
  burnDanger: 0.1,
  burnSuccess: 0.05,

  // remaining/day comparison vs avgDaily
  rpdDanger: 1.5,
  rpdWarn: 1.1,

  // projected delta vs totalAllocated
  projDanger: 0.1,
  projSuccess: -0.05,
};

export const selectSmartDashboardInsight: any = createSelector(
  [selectDashboardInsights, selectMonthTiming, selectTotals],
  (ins, timing, totals): Insight[] => {
    const expenseSpent = totals.spent.needs + totals.spent.wants;
    const expenseAlloc = totals.alloc.needs + totals.alloc.wants;
    const expenseRemaining = Math.max(0, expenseAlloc - expenseSpent);
    const expenseAvgDaily = timing.daysElapsed >= 3 ? expenseSpent / timing.daysElapsed : null;
    const expenseProjectedTotal =
      expenseAvgDaily == null ? null : expenseAvgDaily * Math.max(0, timing.totalDays);
    const expenseRpd = timing.daysLeft > 0 ? expenseRemaining / timing.daysLeft : null;
    const burn = expenseAlloc > 0 ? expenseSpent / expenseAlloc : null;
    const pace = ins.burnVsPace.pace;
    const burnPct = toPctInt(burn);
    const pacePct = toPctInt(pace);

    let insightList: Insight[] = [];

    // 0) If no budget set
    if (!expenseAlloc || expenseAlloc <= 0) {
      insightList.push({
        id: 'no_budget',
        tone: 'muted',
        title: 'smart.title.tip',
        message: 'smart.message.noIncome',
        subtext: undefined,
        ctaLabel: 'budget:modals.addIncome',
      });
    }

    const isBurnFast = burn != null && pace != null && burn > pace + THRESH.burnDanger;
    const isBurnSlow = burn != null && pace != null && burn < pace - THRESH.burnSuccess;
    const isNoSpend = expenseSpent === 0;

    // 1) Strong warning: burn > pace
    if (isBurnFast) {
      insightList.push({
        id: 'burn_fast',
        tone: 'danger',
        title: 'smart.title.headsUp',
        message: 'smart.message.spendingFaster',
        subtext: 'smart.subtext.burnVsPace',
        vars: {
          burnPct: Math.round(burnPct ?? 0),
          pacePct: Math.round(pacePct ?? 0),
        },
        ctaLabel: 'smart.cta.seeBreakdown',
        ctaTarget: 'insights',
      });
    }

    // 2) Projected total (mid/late month)
    // Use it if avg exists (your selector returns null early)
    if (expenseProjectedTotal != null && expenseAlloc > 0) {
      const delta = expenseProjectedTotal - expenseAlloc;
      const deltaRatio = delta / expenseAlloc;

      if (deltaRatio > THRESH.projDanger) {
        insightList.push({
          id: 'project_over',
          tone: 'danger',
          title: 'smart.title.headsUp',
          message: 'smart.message.projectOver',
          vars: { delta: delta }, // format in UI with fmtMoney before passing (recommended), or pass raw and format in i18n (not ideal)
          ctaLabel: 'smart.cta.seeBreakdown',
          ctaTarget: 'insights',
        });
      } else if (deltaRatio < THRESH.projSuccess) {
        insightList.push({
          id: 'project_under',
          tone: 'success',
          title: 'smart.title.nice',
          message: 'smart.message.projectUnder',
          ctaLabel: 'smart.cta.seeInsights',
          ctaTarget: 'insights',
        });
      } else {
        // near
        insightList.push({
          id: 'project_around',
          tone: 'warn',
          title: 'smart.title.tip',
          message: 'smart.message.projectAround',
          ctaLabel: 'smart.cta.seeInsights',
          ctaTarget: 'insights',
        });
      }
    }

    // 3) Remaining per day (very actionable)
    const rpd = expenseRpd;
    if (rpd != null) {
      // compare to avgDaily when available
      if (expenseAvgDaily != null) {
        if (expenseAvgDaily > rpd * THRESH.rpdDanger) {
          insightList.push({
            id: 'rpd_danger',
            tone: 'danger',
            title: 'smart.title.headsUp',
            message: 'smart.message.onlyPerDayLeft',
            subtext: 'smart.subtext.basedOnRemaining',
            vars: { amountPerDay: rpd.toFixed(2) },
            ctaLabel: 'smart.cta.seeInsights',
            ctaTarget: 'insights',
          });
        } else if (expenseAvgDaily > rpd * THRESH.rpdWarn) {
          insightList.push({
            id: 'rpd_warn',
            tone: 'warn',
            title: 'smart.title.tip',
            message: 'smart.message.keepUnderPerDay',
            subtext: 'smart.subtext.basedOnRemaining',
            vars: { amountPerDay: rpd.toFixed(2) },
            ctaLabel: 'smart.cta.seeInsights',
            ctaTarget: 'insights',
          });
        } else {
          insightList.push({
            id: 'rpd_ok',
            tone: 'success',
            title: 'smart.title.nice',
            message: 'smart.message.canSpendPerDay',
            subtext: 'smart.subtext.basedOnRemaining',
            vars: { amountPerDay: rpd.toFixed(2) },
            ctaLabel: 'smart.cta.seeInsights',
            ctaTarget: 'insights',
          });
        }
      } else {
        insightList.push({
          id: 'rpd_ok',
          tone: 'success',
          title: 'smart.title.nice',
          message: 'smart.message.canSpendPerDay',
          subtext: 'smart.subtext.basedOnRemaining',
          vars: { amountPerDay: rpd.toFixed(2) },
          ctaLabel: 'smart.cta.seeInsights',
          ctaTarget: 'insights',
        });
      }
    }

    // 4) Early month / no spend recorded messages
    if (isNoSpend) {
      if (timing.daysElapsed <= 2) {
        insightList.push({
          id: 'fresh_start',
          tone: 'info',
          title: 'smart.title.freshStart',
          message: 'smart.message.noSpendEarly',
          ctaLabel: 'smart.cta.addExpense',
          ctaTarget: 'transactions',
        });
      }
      insightList.push({
        id: 'no_spend_late',
        tone: 'warn',
        title: 'smart.title.headsUp',
        message: 'smart.message.noSpendLater',
        ctaLabel: 'smart.cta.addExpense',
        ctaTarget: 'transactions',
      });
    }

    // Default “nice pace” if burn < pace - success threshold
    if (!isNoSpend && isBurnSlow) {
      insightList.push({
        id: 'burn_slow',
        tone: 'success',
        title: 'smart.title.nice',
        message: 'smart.message.spendingSlower',
        ctaLabel: 'smart.cta.seeInsights',
        ctaTarget: 'insights',
      });
    }

    // Fallback: close to plan
    if (!isNoSpend && burn != null && pace != null && !isBurnFast && !isBurnSlow) {
      insightList.push({
        id: 'close_to_plan',
        tone: 'warn',
        title: 'smart.title.tip',
        message: 'smart.message.closeToPlan',
        ctaLabel: 'smart.cta.seeInsights',
        ctaTarget: 'insights',
      });
    }

    // insightList.push({
    //   id: 'muted',
    //   tone: 'muted',
    //   message: 'smart.message.noSpendEarly',
    // });

    return insightList;
  },
);
