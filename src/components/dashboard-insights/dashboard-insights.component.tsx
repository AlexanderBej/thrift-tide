import React from 'react';
import { useSelector } from 'react-redux';

import StackedBarChart, { BarChartRow } from '../charts/stacked-bar.component';
import { selectDashboardInsights } from '../../store/budget-store/budget-insights.selectors';
import KpiCard from '../kpi-card/kpi-card.component';
import { fmt } from '../../utils/format-data.util';

import './dashboard-insights.styles.scss';

interface DashboardInsightsProps {
  showInsights: 'kpi' | 'distribution';
  income: number;
}

const pct = (n: number | null | undefined) => (n == null ? '—' : `${Math.round(n * 100)}%`);

const DashboardInsights: React.FC<DashboardInsightsProps> = ({ showInsights, income }) => {
  const insights = useSelector(selectDashboardInsights);

  const { totals, avgDaily, projectedTotal, burnVsPace, remainingPerDay, distribution } = insights;
  const { burn, pace } = burnVsPace;

  const normalDailySpend = (income ?? 0) / 30;

  const barChartData: BarChartRow[] = [
    {
      category: 'Needs',
      allocated: totals.alloc.needs,
      spent: distribution.needs,
    },
    {
      category: 'Wants',
      allocated: totals.alloc.wants,
      spent: distribution.wants,
    },
    {
      category: 'Savings',
      allocated: totals.alloc.savings,
      spent: distribution.savings,
    },
  ];

  if (showInsights === 'distribution') return <StackedBarChart data={barChartData} />;

  return (
    <div className="cards-grid">
      <KpiCard
        title="Avg daily spend"
        value={fmt(avgDaily)}
        tone={
          avgDaily
            ? avgDaily > normalDailySpend
              ? 'danger'
              : normalDailySpend - normalDailySpend * 0.2 > avgDaily
                ? 'warn'
                : 'success'
            : 'muted'
        }
      />
      <KpiCard title="Projected total" value={fmt(projectedTotal)} />
      <KpiCard
        title="Burn vs Pace"
        value={`${pct(burn?.total ?? null)} vs ${pct(pace ?? null)}`}
        tone={
          burn?.total != null && pace != null
            ? burn.total > pace + 0.1
              ? 'danger'
              : burn.total < pace - 0.05
                ? 'success'
                : 'warn'
            : 'muted'
        }
      />
      <KpiCard
        title="Remaining / day"
        value={fmt(remainingPerDay?.total ?? null)}
        tone={
          avgDaily && remainingPerDay?.total
            ? avgDaily / 2 > remainingPerDay?.total
              ? 'warn'
              : avgDaily * 0.2 > remainingPerDay.total
                ? 'danger'
                : 'success'
            : 'muted'
        }
      />
    </div>
  );
};

export default DashboardInsights;
