import { createSelector } from '@reduxjs/toolkit';

import { HistoryDocWithSummary, Insight } from '@api/models';
import { selectHistoryDocsWithPercentsAndSummary } from './history.selectors';

const CATEGORIES = ['needs', 'wants', 'savings'] as const;
type CategoryKey = (typeof CATEGORIES)[number];

const safeRatio = (spent: number, alloc: number) => (alloc > 0 ? spent / alloc : 0);

const toneRank: Record<Insight['tone'], number> = {
  danger: 5,
  warn: 4,
  success: 3,
  muted: 2,
  info: 1,
};

export const buildHistorySmartInsightsForMonth = (row: HistoryDocWithSummary): Insight[] => {
  const summary = row.summary;
  const ratios: Record<CategoryKey, number> = {
    needs: safeRatio(summary.spent.needs, summary.allocations.needs),
    wants: safeRatio(summary.spent.wants, summary.allocations.wants),
    savings: safeRatio(summary.spent.savings, summary.allocations.savings),
  };
  const overspentCats = CATEGORIES.filter((cat) => ratios[cat] > 1);
  const under75Cats = CATEGORIES.filter((cat) => ratios[cat] < 0.75);
  const insights: Insight[] = [];

  // Case: month exists but has no spending at all.
  if (summary.totalSpent === 0) {
    insights.push({
      id: `history_no_spending_${row.id}`,
      tone: 'muted',
      title: 'insights:smart.title.freshStart',
      message: 'insights:historySmart.message.noSpending',
    });
  } else {
    // Case: one or more categories are overspent.
    if (overspentCats.length >= 2) {
      insights.push({
        id: `history_overspent_many_${row.id}`,
        tone: 'danger',
        title: 'insights:smart.title.headsUp',
        message: 'insights:historySmart.message.overspentMany',
        vars: { count: overspentCats.length },
      });
    } else if (overspentCats.length === 1) {
      insights.push({
        id: `history_overspent_one_${row.id}`,
        tone: 'danger',
        title: 'insights:smart.title.headsUp',
        message: 'insights:historySmart.message.overspentOne',
      });
    }

    // Case: categories under 75% usage can signal either healthy control or missing tracking.
    if (under75Cats.length >= 2) {
      insights.push({
        id: `history_under_75_many_${row.id}`,
        tone: 'warn',
        title: 'insights:smart.title.tip',
        message: 'insights:historySmart.message.under75Many',
      });
    } else if (under75Cats.length === 1) {
      insights.push({
        id: `history_under_75_one_${row.id}`,
        tone: 'success',
        title: 'insights:smart.title.nice',
        message: 'insights:historySmart.message.under75One',
      });
    }

    // Case: savings below 75% of plan deserves a playful nudge.
    if (ratios.savings < 0.75) {
      insights.push({
        id: `history_savings_low_${row.id}`,
        tone: 'info',
        title: 'insights:smart.title.tip',
        message: 'insights:historySmart.message.savingsLow',
      });
    }

    // Extra case: all categories sit in a steady range and tracking volume is reasonable.
    const balancedMonth =
      summary.totalTxns >= 10 && CATEGORIES.every((cat) => ratios[cat] >= 0.85 && ratios[cat] <= 1);
    if (balancedMonth) {
      insights.push({
        id: `history_balanced_month_${row.id}`,
        tone: 'success',
        title: 'insights:smart.title.nice',
        message: 'insights:historySmart.message.balancedMonth',
      });
    }

    // Extra case: savings hit or beat plan while other categories stay in range.
    if (ratios.savings >= 1 && overspentCats.length === 0) {
      insights.push({
        id: `history_savings_win_${row.id}`,
        tone: 'success',
        title: 'insights:smart.title.nice',
        message: 'insights:historySmart.message.savingsWin',
      });
    }
  }

  // Case: very low transaction count likely means incomplete app usage.
  if (summary.totalTxns < 10 && summary.totalSpent > 0) {
    insights.push({
      id: `history_low_txns_${row.id}`,
      tone: 'info',
      title: 'insights:smart.title.tip',
      message: 'insights:historySmart.message.lowTxns',
      vars: { txns: summary.totalTxns },
    });
  }

  return insights.sort((a, b) => toneRank[b.tone] - toneRank[a.tone]);
};

export const selectHistorySmartInsightsByMonth = createSelector(
  [selectHistoryDocsWithPercentsAndSummary],
  (rows): Record<string, Insight[]> => {
    const byMonth: Record<string, Insight[]> = {};
    for (const row of rows) byMonth[row.id] = buildHistorySmartInsightsForMonth(row);
    return byMonth;
  },
);
