import { createSelector } from '@reduxjs/toolkit';

import { bucketNameKey, toPctInt } from '@shared/utils';
import { makeSelectBucketPanel, selectDashboardInsights } from './budget-insights.selectors';
import { selectMonthTiming } from './budget-period.selectors';
import { selectTotals } from './budget.selectors';
import { Insight } from '@api/models/insight';
import { Bucket, BucketInsightCandidate, InsightTone, toneWeight } from '@api/types';
import { BucketHealthSummary } from '@api/models';

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
        title: 'insights.smart.title.tip',
        message: 'insights.smart.message.noIncome',
        subtext: undefined,
        ctaLabel: 'budget:modals.addIncome',
      });
    }

    // 1) Strong warning: burn > pace
    if (burn != null && pace != null && burn > pace + THRESH.burnDanger) {
      insightList.push({
        id: 'burn_fast',
        tone: 'danger',
        title: 'insights.smart.title.headsUp',
        message: 'insights.smart.message.spendingFaster',
        subtext: 'insights.smart.subtext.burnVsPace',
        vars: {
          burnPct: Math.round(burnPct ?? 0),
          pacePct: Math.round(pacePct ?? 0),
        },
        ctaLabel: 'insights.smart.cta.seeBreakdown',
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
          title: 'insights.smart.title.headsUp',
          message: 'insights.smart.message.projectOver',
          vars: { delta: delta }, // format in UI with fmtMoney before passing (recommended), or pass raw and format in i18n (not ideal)
          ctaLabel: 'insights.smart.cta.seeBreakdown',
          ctaTarget: 'insights',
        });
      }

      if (deltaRatio < THRESH.projSuccess) {
        insightList.push({
          id: 'project_under',
          tone: 'success',
          title: 'insights.smart.title.nice',
          message: 'insights.smart.message.projectUnder',
          ctaLabel: 'insights.smart.cta.seeInsights',
          ctaTarget: 'insights',
        });
      }

      // near
      insightList.push({
        id: 'project_around',
        tone: 'warn',
        title: 'insights.smart.title.tip',
        message: 'insights.smart.message.projectAround',
        ctaLabel: 'insights.smart.cta.seeInsights',
        ctaTarget: 'insights',
      });
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
            title: 'insights.smart.title.headsUp',
            message: 'insights.smart.message.onlyPerDayLeft',
            subtext: 'insights.smart.subtext.basedOnRemaining',
            vars: { amountPerDay: rpd.toFixed(2) },
            ctaLabel: 'insights.smart.cta.seeInsights',
            ctaTarget: 'insights',
          });
        }

        if (ins.avgDaily > rpd * THRESH.rpdWarn) {
          insightList.push({
            id: 'rpd_warn',
            tone: 'warn',
            title: 'insights.smart.title.tip',
            message: 'insights.smart.message.keepUnderPerDay',
            subtext: 'insights.smart.subtext.basedOnRemaining',
            vars: { amountPerDay: rpd.toFixed(2) },
            ctaLabel: 'insights.smart.cta.seeInsights',
            ctaTarget: 'insights',
          });
        }
      }

      insightList.push({
        id: 'rpd_ok',
        tone: 'success',
        title: 'insights.smart.title.nice',
        message: 'insights.smart.message.canSpendPerDay',
        subtext: 'insights.smart.subtext.basedOnRemaining',
        vars: { amountPerDay: rpd.toFixed(2) },
        ctaLabel: 'insights.smart.cta.seeInsights',
        ctaTarget: 'insights',
      });
    }

    // 4) Early month / no spend recorded messages
    if (totals.totalSpent === 0) {
      if (timing.daysElapsed <= 2) {
        insightList.push({
          id: 'fresh_start',
          tone: 'info',
          title: 'insights.smart.title.freshStart',
          message: 'insights.smart.message.noSpendEarly',
          ctaLabel: 'insights.smart.cta.addExpense',
          ctaTarget: 'transactions',
        });
      }
      insightList.push({
        id: 'no_spend_late',
        tone: 'warn',
        title: 'insights.smart.title.headsUp',
        message: 'insights.smart.message.noSpendLater',
        ctaLabel: 'insights.smart.cta.addExpense',
        ctaTarget: 'transactions',
      });
    }

    // Default “nice pace” if burn < pace - success threshold
    if (burn != null && pace != null && burn < pace - THRESH.burnSuccess) {
      insightList.push({
        id: 'burn_slow',
        tone: 'success',
        title: 'insights.smart.title.nice',
        message: 'insights.smart.message.spendingSlower',
        ctaLabel: 'insights.smart.cta.seeInsights',
        ctaTarget: 'insights',
      });
    }

    // Fallback: close to plan
    if (burn != null && pace != null) {
      insightList.push({
        id: 'close_to_plan',
        tone: 'warn',
        title: 'insights.smart.title.tip',
        message: 'insights.smart.message.closeToPlan',
        ctaLabel: 'insights.smart.cta.seeInsights',
        ctaTarget: 'insights',
      });
    }

    // insightList.push({
    //   id: 'muted',
    //   tone: 'muted',
    //   message: 'insights.smart.message.noSpendEarly',
    // });

    return insightList;
  },
);

const BUCKET_THRESH = {
  overPaceDanger: 0.12,
  overPaceWarn: 0.05,
  underPaceSuccess: 0.06,

  // remaining/day vs normal/day
  rpdDanger: 0.4,
  rpdWarn: 0.6,

  daysToZeroDanger: 5,
};

export const makeSelectBucketInsight = (bucket: Bucket) =>
  createSelector([makeSelectBucketPanel(bucket), selectMonthTiming], (p, t): Insight => {
    const nameKey = bucketNameKey(bucket);

    // No budget
    if (!p.alloc || p.alloc <= 0) {
      return {
        id: `bucket_${bucket}_no_budget`,
        tone: 'muted',
        title: 'insights.bucket.title.info',
        message: 'insights.bucket.message.noBudget',
        vars: { bucketNameKey: nameKey },
        ctaLabel: 'insights.bucket.cta.reviewBucket',
        ctaTarget: `bucket:${bucket}`,
      };
    }

    // Early month noise
    if (t.daysElapsed < 3) {
      return {
        id: `bucket_${bucket}_early`,
        tone: 'info',
        title: 'insights.bucket.title.info',
        message: 'insights.bucket.message.earlyMonth',
        vars: { bucketNameKey: nameKey },
        ctaLabel: 'insights.bucket.cta.reviewBucket',
        ctaTarget: `bucket:${bucket}`,
      };
    }

    const pace = t.totalDays > 0 ? t.daysElapsed / t.totalDays : null;
    const burn = p.alloc > 0 ? p.spent / p.alloc : null;

    const burnPct = toPctInt(burn);
    const pacePct = toPctInt(pace);

    // Run-out warning (strongest)
    if (p.daysToZero != null && p.daysToZero <= BUCKET_THRESH.daysToZeroDanger) {
      return {
        id: `bucket_${bucket}_runout_days`,
        tone: 'danger',
        title: 'insights.bucket.title.headsUp',
        message: 'insights.bucket.message.runOutInDays',
        vars: { bucketNameKey: nameKey, days: p.daysToZero },
        ctaLabel: 'insights.bucket.cta.reviewBucket',
        ctaTarget: `bucket:${bucket}`,
      };
    }

    // Burn vs pace
    if (burn != null && pace != null) {
      if (burn > pace + BUCKET_THRESH.overPaceDanger) {
        return {
          id: `bucket_${bucket}_overpace_danger`,
          tone: 'danger',
          title: 'insights.bucket.title.headsUp',
          message: 'insights.bucket.message.overPace',
          subtext: 'insights.bucket.subtext.burnVsPace',
          vars: { bucketNameKey: nameKey, burnPct: burnPct ?? 0, pacePct: pacePct ?? 0 },
          ctaLabel: 'insights.bucket.cta.reviewBucket',
          ctaTarget: `bucket:${bucket}`,
        };
      }

      if (burn > pace + BUCKET_THRESH.overPaceWarn) {
        return {
          id: `bucket_${bucket}_overpace_warn`,
          tone: 'warn',
          title: 'insights.bucket.title.tip',
          message: 'insights.bucket.message.nearPace',
          subtext: 'insights.bucket.subtext.burnVsPace',
          vars: { bucketNameKey: nameKey, burnPct: burnPct ?? 0, pacePct: pacePct ?? 0 },
          ctaLabel: 'insights.bucket.cta.reviewBucket',
          ctaTarget: `bucket:${bucket}`,
        };
      }
    }

    // Remaining/day guidance
    if (p.remainingPerDay != null && t.totalDays > 0 && t.daysLeft > 0) {
      const normalPerDay = p.alloc / t.totalDays;
      const ratio = normalPerDay > 0 ? p.remainingPerDay / normalPerDay : null;

      if (ratio != null && ratio < BUCKET_THRESH.rpdDanger) {
        return {
          id: `bucket_${bucket}_rpd_danger`,
          tone: 'danger',
          title: 'insights.bucket.title.headsUp',
          message: 'insights.bucket.message.perDayVeryTight',
          subtext: 'insights.bucket.subtext.basedOnRemaining',
          vars: { bucketNameKey: nameKey, amountPerDay: p.remainingPerDay.toFixed(2) },
          ctaLabel: 'insights.bucket.cta.reviewBucket',
          ctaTarget: `bucket:${bucket}`,
        };
      }

      if (ratio != null && ratio < BUCKET_THRESH.rpdWarn) {
        return {
          id: `bucket_${bucket}_rpd_warn`,
          tone: 'warn',
          title: 'insights.bucket.title.tip',
          message: 'insights.bucket.message.perDayTight',
          subtext: 'insights.bucket.subtext.basedOnRemaining',
          vars: { bucketNameKey: nameKey, amountPerDay: p.remainingPerDay.toFixed(2) },
          ctaLabel: 'insights.bucket.cta.reviewBucket',
          ctaTarget: `bucket:${bucket}`,
        };
      }

      // under pace positive
      if (burn != null && pace != null && burn < pace - BUCKET_THRESH.underPaceSuccess) {
        return {
          id: `bucket_${bucket}_underpace`,
          tone: 'success',
          title: 'insights.bucket.title.nice',
          message: 'insights.bucket.message.underPace',
          subtext: 'insights.bucket.subtext.burnVsPace',
          vars: { bucketNameKey: nameKey, burnPct: burnPct ?? 0, pacePct: pacePct ?? 0 },
          ctaLabel: 'insights.bucket.cta.reviewBucket',
          ctaTarget: `bucket:${bucket}`,
        };
      }

      // default: perDayOk
      return {
        id: `bucket_${bucket}_perday_ok`,
        tone: 'success',
        title: 'insights.bucket.title.nice',
        message: 'insights.bucket.message.perDayOk',
        subtext: 'insights.bucket.subtext.basedOnRemaining',
        vars: { bucketNameKey: nameKey, amountPerDay: p.remainingPerDay.toFixed(2) },
        ctaLabel: 'insights.bucket.cta.reviewBucket',
        ctaTarget: `bucket:${bucket}`,
      };
    }

    // fallback: healthy
    return {
      id: `bucket_${bucket}_healthy`,
      tone: 'success',
      title: 'insights.bucket.title.nice',
      message: 'insights.bucket.message.bucketHealthy',
      vars: { bucketNameKey: nameKey },
      ctaLabel: 'insights.bucket.cta.reviewBucket',
      ctaTarget: `bucket:${bucket}`,
    };
  });

export const makeSelectBucketInsightList = (bucket: Bucket) =>
  createSelector(
    [makeSelectBucketPanel(bucket), selectMonthTiming],
    (p, t): BucketInsightCandidate[] => {
      const nameKey = bucketNameKey(bucket);
      const out: BucketInsightCandidate[] = [];

      const pace = t.totalDays > 0 ? t.daysElapsed / t.totalDays : null;
      const burn = p.alloc > 0 ? p.spent / p.alloc : null;

      const burnPct = toPctInt(burn);
      const pacePct = toPctInt(pace);

      // Candidate: no budget
      if (!p.alloc || p.alloc <= 0) {
        out.push({
          id: `bucket_${bucket}_no_budget`,
          tone: 'muted',
          title: 'insights.bucket.title.info',
          message: 'insights.bucket.message.noBudget',
          vars: { bucketNameKey: nameKey },
          ctaLabel: 'insights.bucket.cta.reviewBucket',
          ctaTarget: `bucket:${bucket}`,
          group: 'setup',
          chip: { key: 'insights.bucket.chip.noBudget' },
        });
        return out;
      }

      // Candidate: early month noise (kept but low priority)
      if (t.daysElapsed < 3) {
        out.push({
          id: `bucket_${bucket}_early`,
          tone: 'info',
          title: 'insights.bucket.title.info',
          message: 'insights.bucket.message.earlyMonth',
          vars: { bucketNameKey: nameKey },
          ctaLabel: 'insights.bucket.cta.reviewBucket',
          ctaTarget: `bucket:${bucket}`,
          group: 'setup',
          chip: { key: 'insights.bucket.chip.earlyMonth' },
        });
        // don't return; real dangers can still exist if user spent a lot on day 1-2
      }

      // Candidate: run-out days (urgent)
      if (p.daysToZero != null) {
        out.push({
          id: `bucket_${bucket}_runout_days`,
          tone: p.daysToZero <= BUCKET_THRESH.daysToZeroDanger ? 'danger' : 'warn',
          title:
            p.daysToZero <= BUCKET_THRESH.daysToZeroDanger
              ? 'insights.bucket.title.headsUp'
              : 'insights.bucket.title.tip',
          message: 'insights.bucket.message.runOutInDays',
          vars: { bucketNameKey: nameKey, days: p.daysToZero },
          ctaLabel: 'insights.bucket.cta.reviewBucket',
          ctaTarget: `bucket:${bucket}`,
          group: 'runout',
          chip: { key: 'insights.bucket.chip.runOutInDays', vars: { days: p.daysToZero } },
          _scoreHint: { daysToZero: p.daysToZero, burn, pace },
        });
      }

      // Candidate: burn vs pace (danger/warn/success)
      if (burn != null && pace != null) {
        const delta = burn - pace;

        if (delta > BUCKET_THRESH.overPaceDanger) {
          out.push({
            id: `bucket_${bucket}_overpace_danger`,
            tone: 'danger',
            title: 'insights.bucket.title.headsUp',
            message: 'insights.bucket.message.overPace',
            subtext: 'insights.bucket.subtext.burnVsPace',
            vars: { bucketNameKey: nameKey, burnPct: burnPct ?? 0, pacePct: pacePct ?? 0 },
            ctaLabel: 'insights.bucket.cta.reviewBucket',
            ctaTarget: `bucket:${bucket}`,
            group: 'overpace',
            chip: { key: 'insights.bucket.chip.overPace' },
            _scoreHint: { burn, pace },
          });
        } else if (delta > BUCKET_THRESH.overPaceWarn) {
          out.push({
            id: `bucket_${bucket}_overpace_warn`,
            tone: 'warn',
            title: 'insights.bucket.title.tip',
            message: 'insights.bucket.message.nearPace',
            subtext: 'insights.bucket.subtext.burnVsPace',
            vars: { bucketNameKey: nameKey, burnPct: burnPct ?? 0, pacePct: pacePct ?? 0 },
            ctaLabel: 'insights.bucket.cta.reviewBucket',
            ctaTarget: `bucket:${bucket}`,
            group: 'overpace',
            chip: { key: 'insights.bucket.chip.nearPace' },
            _scoreHint: { burn, pace },
          });
        } else if (burn < pace - BUCKET_THRESH.underPaceSuccess) {
          out.push({
            id: `bucket_${bucket}_underpace`,
            tone: 'success',
            title: 'insights.bucket.title.nice',
            message: 'insights.bucket.message.underPace',
            subtext: 'insights.bucket.subtext.burnVsPace',
            vars: { bucketNameKey: nameKey, burnPct: burnPct ?? 0, pacePct: pacePct ?? 0 },
            ctaLabel: 'insights.bucket.cta.reviewBucket',
            ctaTarget: `bucket:${bucket}`,
            group: 'pace',
            chip: { key: 'insights.bucket.chip.underPace' },
            _scoreHint: { burn, pace },
          });
        }
      }

      // Candidate: remaining/day guidance (actionable)
      if (p.remainingPerDay != null && t.totalDays > 0 && t.daysLeft > 0) {
        const normalPerDay = p.alloc / t.totalDays;
        const ratio = normalPerDay > 0 ? p.remainingPerDay / normalPerDay : null;

        if (ratio != null && ratio < BUCKET_THRESH.rpdDanger) {
          out.push({
            id: `bucket_${bucket}_rpd_danger`,
            tone: 'danger',
            title: 'insights.bucket.title.headsUp',
            message: 'insights.bucket.message.perDayVeryTight',
            subtext: 'insights.bucket.subtext.basedOnRemaining',
            vars: { bucketNameKey: nameKey, amountPerDay: p.remainingPerDay.toFixed(2) },
            ctaLabel: 'insights.bucket.cta.reviewBucket',
            ctaTarget: `bucket:${bucket}`,
            group: 'rpd',
            chip: {
              key: 'insights.bucket.chip.perDayLeft',
              vars: { amountPerDay: p.remainingPerDay.toFixed(0) },
            },
            _scoreHint: { remainingPerDayRatio: ratio, burn, pace },
          });
        } else if (ratio != null && ratio < BUCKET_THRESH.rpdWarn) {
          out.push({
            id: `bucket_${bucket}_rpd_warn`,
            tone: 'warn',
            title: 'insights.bucket.title.tip',
            message: 'insights.bucket.message.perDayTight',
            subtext: 'insights.bucket.subtext.basedOnRemaining',
            vars: { bucketNameKey: nameKey, amountPerDay: p.remainingPerDay.toFixed(2) },
            ctaLabel: 'insights.bucket.cta.reviewBucket',
            ctaTarget: `bucket:${bucket}`,
            group: 'rpd',
            chip: {
              key: 'insights.bucket.chip.perDayLeft',
              vars: { amountPerDay: p.remainingPerDay.toFixed(0) },
            },
            _scoreHint: { remainingPerDayRatio: ratio, burn, pace },
          });
        } else {
          out.push({
            id: `bucket_${bucket}_perday_ok`,
            tone: 'success',
            title: 'insights.bucket.title.nice',
            message: 'insights.bucket.message.perDayOk',
            subtext: 'insights.bucket.subtext.basedOnRemaining',
            vars: { bucketNameKey: nameKey, amountPerDay: p.remainingPerDay.toFixed(2) },
            ctaLabel: 'insights.bucket.cta.reviewBucket',
            ctaTarget: `bucket:${bucket}`,
            group: 'rpd',
            chip: {
              key: 'insights.bucket.chip.perDayLeft',
              vars: { amountPerDay: p.remainingPerDay.toFixed(0) },
            },
            _scoreHint: { remainingPerDayRatio: ratio, burn, pace },
          });
        }
      }

      // Fallback
      if (out.length === 0) {
        out.push({
          id: `bucket_${bucket}_healthy`,
          tone: 'success',
          title: 'insights.bucket.title.nice',
          message: 'insights.bucket.message.bucketHealthy',
          vars: { bucketNameKey: nameKey },
          ctaLabel: 'insights.bucket.cta.reviewBucket',
          ctaTarget: `bucket:${bucket}`,
          group: 'health',
          chip: { key: 'insights.bucket.chip.onTrack' },
        });
      }

      return out;
    },
  );

// Convenience selector: all 3 bucket insights in one go
export const selectBucketInsights = createSelector(
  [
    makeSelectBucketInsight('needs'),
    makeSelectBucketInsight('wants'),
    makeSelectBucketInsight('savings'),
  ],
  (needs, wants, savings) => ({ needs, wants, savings }),
);

export const makeSelectBucketPrimaryInsight = (bucket: Bucket) =>
  createSelector([makeSelectBucketInsightList(bucket)], (list) => {
    const sorted = [...list].sort((a, b) => scoreBucketInsight(b) - scoreBucketInsight(a));
    return sorted[0];
  });

export const selectBucketPrimaryInsights = createSelector(
  [
    makeSelectBucketPrimaryInsight('needs'),
    makeSelectBucketPrimaryInsight('wants'),
    makeSelectBucketPrimaryInsight('savings'),
  ],
  (needs, wants, savings) => ({ needs, wants, savings }),
);

export const makeSelectBucketTopInsights = (bucket: Bucket, limit = 3) =>
  createSelector([makeSelectBucketInsightList(bucket)], (list) => {
    const sorted = [...list].sort((a, b) => scoreBucketInsight(b) - scoreBucketInsight(a));

    // Deduplicate by "theme"
    const deduped = uniqueBy(sorted, insightGroupKey);

    // If you have a danger insight, deprioritize "early month" info
    const hasDangerOrWarn = deduped.some((x) => x.tone === 'danger' || x.tone === 'warn');
    const filtered = hasDangerOrWarn
      ? deduped.filter((x) => !x.id.includes('_early') && x.tone !== 'muted')
      : deduped;

    return filtered.slice(0, limit);
  });

export const selectBucketsTopInsights = createSelector(
  [
    makeSelectBucketTopInsights('needs'),
    makeSelectBucketTopInsights('wants'),
    makeSelectBucketTopInsights('savings'),
  ],
  (needs, wants, savings) => ({ needs, wants, savings }),
);

export const selectBucketHealthSummary = createSelector(
  [
    makeSelectBucketTopInsights('needs', 1),
    makeSelectBucketTopInsights('wants', 1),
    makeSelectBucketTopInsights('savings', 1),
  ],
  (needs, wants, savings): BucketHealthSummary => {
    const items = [
      { bucket: 'needs' as const, insight: needs[0] },
      { bucket: 'wants' as const, insight: wants[0] },
      { bucket: 'savings' as const, insight: savings[0] },
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
      details: items.map(({ bucket, insight }) => ({
        bucket,
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

export const scoreBucketInsight = (x: BucketInsightCandidate): number => {
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
