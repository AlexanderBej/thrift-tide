import { createSelector } from '@reduxjs/toolkit';

import { catNameKey, toPctInt } from '@shared/utils';
import { makeSelectCategoryPanel, selectDashboardInsights } from './budget-insights.selectors';
import { selectMonthTiming } from './budget-period.selectors';
import { selectTotals } from './budget.selectors';
import { Insight } from '@api/models/insight';
import { Category, CategoryInsightCandidate, InsightTone, toneWeight } from '@api/types';
import { CategoryHealthSummary } from '@api/models';

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
    const pacePct = toPctInt(ins.burnVsPace.pace);
    const burnPct = toPctInt(ins.burnVsPace.burn.total);
    const burn = ins.burnVsPace.burn.total;
    const pace = ins.burnVsPace.pace;

    let insightList: Insight[] = [];

    // 0) If no budget set
    if (!totals.totalAllocated || totals.totalAllocated <= 0) {
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
    const isNoSpend = totals.totalSpent === 0;

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
    if (ins.projectedTotal != null && totals.totalAllocated > 0) {
      const delta = ins.projectedTotal - totals.totalAllocated;
      const deltaRatio = delta / totals.totalAllocated;

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
    const rpd = ins.remainingPerDay?.total ?? null;
    if (rpd != null) {
      // compare to avgDaily when available
      if (ins.avgDaily != null) {
        if (ins.avgDaily > rpd * THRESH.rpdDanger) {
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
        } else if (ins.avgDaily > rpd * THRESH.rpdWarn) {
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

const CATEGORY_THRESH = {
  overPaceDanger: 0.12,
  overPaceWarn: 0.05,
  underPaceSuccess: 0.06,

  // remaining/day vs normal/day
  rpdDanger: 0.4,
  rpdWarn: 0.6,

  daysToZeroDanger: 5,
};

export const makeSelectCategoryInsight = (cat: Category) =>
  createSelector([makeSelectCategoryPanel(cat), selectMonthTiming], (p, t): Insight => {
    const nameKey = catNameKey(cat);

    // No budget
    if (!p.alloc || p.alloc <= 0) {
      return {
        id: `category_${cat}_no_budget`,
        tone: 'muted',
        title: 'category.title.info',
        message: 'category.message.noBudget',
        vars: { catNameKey: nameKey },
        ctaLabel: 'category.cta.reviewCategory',
        ctaTarget: `category:${cat}`,
      };
    }

    // Early month noise
    if (t.daysElapsed < 3) {
      return {
        id: `category_${cat}_early`,
        tone: 'info',
        title: 'category.title.info',
        message: 'category.message.earlyMonth',
        vars: { catNameKey: nameKey },
        ctaLabel: 'category.cta.reviewCategory',
        ctaTarget: `category:${cat}`,
      };
    }

    const pace = t.totalDays > 0 ? t.daysElapsed / t.totalDays : null;
    const burn = p.alloc > 0 ? p.spent / p.alloc : null;

    const burnPct = toPctInt(burn);
    const pacePct = toPctInt(pace);

    // Run-out warning (strongest)
    if (
      p.daysToZero != null &&
      p.daysToZero <= CATEGORY_THRESH.daysToZeroDanger &&
      p.daysToZero <= t.daysLeft
    ) {
      return {
        id: `category_${cat}_runout_days`,
        tone: 'danger',
        title: 'category.title.headsUp',
        message: 'category.message.runOutInDays',
        vars: { catNameKey: nameKey, days: p.daysToZero },
        ctaLabel: 'category.cta.reviewCategory',
        ctaTarget: `category:${cat}`,
      };
    }

    // Burn vs pace
    if (burn != null && pace != null) {
      if (burn > pace + CATEGORY_THRESH.overPaceDanger) {
        return {
          id: `category_${cat}_overpace_danger`,
          tone: 'danger',
          title: 'category.title.headsUp',
          message: 'category.message.overPace',
          subtext: 'category.subtext.burnVsPace',
          vars: { catNameKey: nameKey, burnPct: burnPct ?? 0, pacePct: pacePct ?? 0 },
          ctaLabel: 'category.cta.reviewCategory',
          ctaTarget: `category:${cat}`,
        };
      }

      if (burn > pace + CATEGORY_THRESH.overPaceWarn) {
        return {
          id: `category_${cat}_overpace_warn`,
          tone: 'warn',
          title: 'category.title.tip',
          message: 'category.message.nearPace',
          subtext: 'category.subtext.burnVsPace',
          vars: { catNameKey: nameKey, burnPct: burnPct ?? 0, pacePct: pacePct ?? 0 },
          ctaLabel: 'category.cta.reviewCategory',
          ctaTarget: `category:${cat}`,
        };
      }
    }

    // Remaining/day guidance
    if (p.remainingPerDay != null && t.totalDays > 0 && t.daysLeft > 0) {
      const normalPerDay = p.alloc / t.totalDays;
      const ratio = normalPerDay > 0 ? p.remainingPerDay / normalPerDay : null;

      if (ratio != null && ratio < CATEGORY_THRESH.rpdDanger) {
        return {
          id: `category_${cat}_rpd_danger`,
          tone: 'danger',
          title: 'category.title.headsUp',
          message: 'category.message.perDayVeryTight',
          subtext: 'category.subtext.basedOnRemaining',
          vars: { catNameKey: nameKey, amountPerDay: p.remainingPerDay.toFixed(2) },
          ctaLabel: 'category.cta.reviewCategory',
          ctaTarget: `category:${cat}`,
        };
      }

      if (ratio != null && ratio < CATEGORY_THRESH.rpdWarn) {
        return {
          id: `category_${cat}_rpd_warn`,
          tone: 'warn',
          title: 'category.title.tip',
          message: 'category.message.perDayTight',
          subtext: 'category.subtext.basedOnRemaining',
          vars: { catNameKey: nameKey, amountPerDay: p.remainingPerDay.toFixed(2) },
          ctaLabel: 'category.cta.reviewCategory',
          ctaTarget: `category:${cat}`,
        };
      }

      // under pace positive
      if (burn != null && pace != null && burn < pace - CATEGORY_THRESH.underPaceSuccess) {
        return {
          id: `category_${cat}_underpace`,
          tone: 'success',
          title: 'category.title.nice',
          message: 'category.message.underPace',
          subtext: 'category.subtext.burnVsPace',
          vars: { catNameKey: nameKey, burnPct: burnPct ?? 0, pacePct: pacePct ?? 0 },
          ctaLabel: 'category.cta.reviewCategory',
          ctaTarget: `category:${cat}`,
        };
      }

      // default: perDayOk
      return {
        id: `category_${cat}_perday_ok`,
        tone: 'success',
        title: 'category.title.nice',
        message: 'category.message.perDayOk',
        subtext: 'category.subtext.basedOnRemaining',
        vars: { catNameKey: nameKey, amountPerDay: p.remainingPerDay.toFixed(2) },
        ctaLabel: 'category.cta.reviewCategory',
        ctaTarget: `category:${cat}`,
      };
    }

    // fallback: healthy
    return {
      id: `category_${cat}_healthy`,
      tone: 'success',
      title: 'category.title.nice',
      message: 'category.message.categoryHealthy',
      vars: { catNameKey: nameKey },
      ctaLabel: 'category.cta.reviewCategory',
      ctaTarget: `category:${cat}`,
    };
  });

export const makeSelectCategoryInsightList = (category: Category) =>
  createSelector(
    [makeSelectCategoryPanel(category), selectMonthTiming],
    (p, t): CategoryInsightCandidate[] => {
      const nameKey = catNameKey(category);
      const out: CategoryInsightCandidate[] = [];

      const pace = t.totalDays > 0 ? t.daysElapsed / t.totalDays : null;
      const burn = p.alloc > 0 ? p.spent / p.alloc : null;

      const burnPct = toPctInt(burn);
      const pacePct = toPctInt(pace);

      // Candidate: no budget
      if (!p.alloc || p.alloc <= 0) {
        out.push({
          id: `category_${category}_no_budget`,
          tone: 'muted',
          title: 'category.title.info',
          message: 'category.message.noBudget',
          vars: { catNameKey: nameKey },
          ctaLabel: 'category.cta.reviewCategory',
          ctaTarget: `category:${category}`,
          group: 'setup',
          chip: { key: 'category.chip.noBudget' },
        });
        return out;
      }

      // Candidate: early month noise (kept but low priority)
      if (t.daysElapsed < 3) {
        out.push({
          id: `category_${category}_early`,
          tone: 'info',
          title: 'category.title.info',
          message: 'category.message.earlyMonth',
          vars: { catNameKey: nameKey },
          ctaLabel: 'category.cta.reviewCategory',
          ctaTarget: `category:${category}`,
          group: 'setup',
          chip: { key: 'category.chip.earlyMonth' },
        });
        // don't return; real dangers can still exist if user spent a lot on day 1-2
      }

      // Candidate: run-out days (urgent)
      if (p.daysToZero != null && p.daysToZero <= t.daysLeft) {
        out.push({
          id: `category_${category}_runout_days`,
          tone: p.daysToZero <= CATEGORY_THRESH.daysToZeroDanger ? 'danger' : 'warn',
          title:
            p.daysToZero <= CATEGORY_THRESH.daysToZeroDanger
              ? 'category.title.headsUp'
              : 'category.title.tip',
          message: 'category.message.runOutInDays',
          vars: { catNameKey: nameKey, days: p.daysToZero },
          ctaLabel: 'category.cta.reviewCategory',
          ctaTarget: `category:${category}`,
          group: 'runout',
          chip: { key: 'category.chip.runOutInDays', vars: { days: p.daysToZero } },
          _scoreHint: { daysToZero: p.daysToZero, burn, pace },
        });
      }

      // Candidate: burn vs pace (danger/warn/success)
      if (burn != null && pace != null) {
        const delta = burn - pace;

        if (delta > CATEGORY_THRESH.overPaceDanger) {
          out.push({
            id: `category_${category}_overpace_danger`,
            tone: 'danger',
            title: 'category.title.headsUp',
            message: 'category.message.overPace',
            subtext: 'category.subtext.burnVsPace',
            vars: { catNameKey: nameKey, burnPct: burnPct ?? 0, pacePct: pacePct ?? 0 },
            ctaLabel: 'category.cta.reviewCategory',
            ctaTarget: `category:${category}`,
            group: 'overpace',
            chip: { key: 'category.chip.overPace' },
            _scoreHint: { burn, pace },
          });
        } else if (delta > CATEGORY_THRESH.overPaceWarn) {
          out.push({
            id: `category_${category}_overpace_warn`,
            tone: 'warn',
            title: 'category.title.tip',
            message: 'category.message.nearPace',
            subtext: 'category.subtext.burnVsPace',
            vars: { catNameKey: nameKey, burnPct: burnPct ?? 0, pacePct: pacePct ?? 0 },
            ctaLabel: 'category.cta.reviewCategory',
            ctaTarget: `category:${category}`,
            group: 'overpace',
            chip: { key: 'category.chip.nearPace' },
            _scoreHint: { burn, pace },
          });
        } else if (burn < pace - CATEGORY_THRESH.underPaceSuccess) {
          out.push({
            id: `category_${category}_underpace`,
            tone: 'success',
            title: 'category.title.nice',
            message: 'category.message.underPace',
            subtext: 'category.subtext.burnVsPace',
            vars: { catNameKey: nameKey, burnPct: burnPct ?? 0, pacePct: pacePct ?? 0 },
            ctaLabel: 'category.cta.reviewCategory',
            ctaTarget: `category:${category}`,
            group: 'pace',
            chip: { key: 'category.chip.underPace' },
            _scoreHint: { burn, pace },
          });
        }
      }

      // Candidate: remaining/day guidance (actionable)
      if (p.remainingPerDay != null && t.totalDays > 0 && t.daysLeft > 0) {
        const normalPerDay = p.alloc / t.totalDays;
        const ratio = normalPerDay > 0 ? p.remainingPerDay / normalPerDay : null;

        if (ratio != null && ratio < CATEGORY_THRESH.rpdDanger) {
          out.push({
            id: `category_${category}_rpd_danger`,
            tone: 'danger',
            title: 'category.title.headsUp',
            message: 'category.message.perDayVeryTight',
            subtext: 'category.subtext.basedOnRemaining',
            vars: { catNameKey: nameKey, amountPerDay: p.remainingPerDay.toFixed(2) },
            ctaLabel: 'category.cta.reviewCategory',
            ctaTarget: `category:${category}`,
            group: 'rpd',
            chip: {
              key: 'category.chip.perDayLeft',
              vars: { amountPerDay: p.remainingPerDay.toFixed(0) },
            },
            _scoreHint: { remainingPerDayRatio: ratio, burn, pace },
          });
        } else if (ratio != null && ratio < CATEGORY_THRESH.rpdWarn) {
          out.push({
            id: `category_${category}_rpd_warn`,
            tone: 'warn',
            title: 'category.title.tip',
            message: 'category.message.perDayTight',
            subtext: 'category.subtext.basedOnRemaining',
            vars: { catNameKey: nameKey, amountPerDay: p.remainingPerDay.toFixed(2) },
            ctaLabel: 'category.cta.reviewCategory',
            ctaTarget: `category:${category}`,
            group: 'rpd',
            chip: {
              key: 'category.chip.perDayLeft',
              vars: { amountPerDay: p.remainingPerDay.toFixed(0) },
            },
            _scoreHint: { remainingPerDayRatio: ratio, burn, pace },
          });
        } else {
          out.push({
            id: `category_${category}_perday_ok`,
            tone: 'success',
            title: 'category.title.nice',
            message: 'category.message.perDayOk',
            subtext: 'category.subtext.basedOnRemaining',
            vars: { catNameKey: nameKey, amountPerDay: p.remainingPerDay.toFixed(2) },
            ctaLabel: 'category.cta.reviewCategory',
            ctaTarget: `category:${category}`,
            group: 'rpd',
            chip: {
              key: 'category.chip.perDayLeft',
              vars: { amountPerDay: p.remainingPerDay.toFixed(0) },
            },
            _scoreHint: { remainingPerDayRatio: ratio, burn, pace },
          });
        }
      }

      // Fallback
      if (out.length === 0) {
        out.push({
          id: `category_${category}_healthy`,
          tone: 'success',
          title: 'category.title.nice',
          message: 'category.message.categoryHealthy',
          vars: { catNameKey: nameKey },
          ctaLabel: 'category.cta.reviewCategory',
          ctaTarget: `category:${category}`,
          group: 'health',
          chip: { key: 'category.chip.onTrack' },
        });
      }

      return out;
    },
  );

// Convenience selector: all 3 category insights in one go
export const selectCategoryInsights = createSelector(
  [
    makeSelectCategoryInsight('needs'),
    makeSelectCategoryInsight('wants'),
    makeSelectCategoryInsight('savings'),
  ],
  (needs, wants, savings) => ({ needs, wants, savings }),
);

export const makeSelectCategoryTopInsights = (category: Category, limit = 3) =>
  createSelector([makeSelectCategoryInsightList(category)], (list) => {
    const sorted = [...list].sort((a, b) => scoreCategoryInsight(b) - scoreCategoryInsight(a));

    // Deduplicate by "theme"
    const deduped = uniqueBy(sorted, insightGroupKey);

    // If you have a danger insight, deprioritize "early month" info
    const hasDangerOrWarn = deduped.some((x) => x.tone === 'danger' || x.tone === 'warn');
    const filtered = hasDangerOrWarn
      ? deduped.filter((x) => !x.id.includes('_early') && x.tone !== 'muted')
      : deduped;

    return filtered.slice(0, limit);
  });

export const selectCategoriesTopInsights = createSelector(
  [
    makeSelectCategoryTopInsights('needs'),
    makeSelectCategoryTopInsights('wants'),
    makeSelectCategoryTopInsights('savings'),
  ],
  (needs, wants, savings) => ({ needs, wants, savings }),
);

export const selectCategoryHealthSummary = createSelector(
  [
    makeSelectCategoryTopInsights('needs', 1),
    makeSelectCategoryTopInsights('wants', 1),
    makeSelectCategoryTopInsights('savings', 1),
  ],
  (needs, wants, savings): CategoryHealthSummary => {
    const items = [
      { category: 'needs' as const, insight: needs[0] },
      { category: 'wants' as const, insight: wants[0] },
      { category: 'savings' as const, insight: savings[0] },
    ].filter((x) => x.insight);

    let healthyCount = 0;
    let attentionCount = 0;

    for (const { insight } of items) {
      if (insight.tone === 'danger' || insight.tone === 'warn') {
        attentionCount++;
      } else if (insight.tone === 'success') {
        healthyCount++;
      }
    }

    return {
      healthyCount,
      attentionCount,
      details: items.map(({ category, insight }) => ({
        category,
        tone: insight.tone,
        insight,
      })),
    };
  },
);

/* ----------------------------------------------
-------------------------------------------------
------------------- HELPERS ---------------------
-------------------------------------------------
---------------------------------------------- */

export const scoreCategoryInsight = (x: CategoryInsightCandidate): number => {
  let score = toneWeight[x.tone as InsightTone] ?? 0;

  const h = x._scoreHint;

  // Strong urgency: days to zero
  if (h?.daysToZero != null) {
    // 0..5 days => huge score; larger => smaller
    score += Math.max(0, 140 - h.daysToZero * 20);
  }

  // Over pace urgency: burn - pace
  if (h?.burn != null && h?.pace != null) {
    const delta = h.burn - h.pace;
    if (delta > 0) score += Math.min(120, delta * 600); // 0.10 => +60
  }

  // Tight remaining/day: lower ratio is worse
  if (h?.remainingPerDayRatio != null) {
    const r = h.remainingPerDayRatio;
    if (r < 1) score += Math.min(120, (1 - r) * 200); // r=0.4 => +120
  }

  // Prefer actionable messages a bit
  if (x.id.includes('rpd') || x.message.includes('perDay')) score += 30;

  return score;
};

export const uniqueBy = <T>(items: T[], keyFn: (x: T) => string) => {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const x of items) {
    const k = keyFn(x);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(x);
  }
  return out;
};

export const insightGroupKey = (x: Insight) => {
  // Group similar variants so you don't show "over pace warn" AND "over pace danger" together
  if (x.id.includes('overpace')) return 'overpace';
  if (x.id.includes('runout')) return 'runout';
  if (x.id.includes('rpd')) return 'rpd';
  if (x.id.includes('early')) return 'early';
  if (x.id.includes('no_budget')) return 'no_budget';
  return x.id;
};
