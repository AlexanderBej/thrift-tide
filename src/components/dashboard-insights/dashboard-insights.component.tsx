import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import KpiCard from '../kpi-card/kpi-card.component';
import { BarChartRow, StackedBarChart } from '@shared/ui';
import { useFormatMoney } from '@shared/hooks';
import { selectDashboardInsights, selectMonthTiming } from '@store/budget-store';

import './dashboard-insights.styles.scss';

interface DashboardInsightsProps {
  showInsights: 'kpi' | 'distribution';
}

const pct = (n: number | null | undefined) => (n == null ? '—' : `${Math.round(n * 100)}%`);

const DashboardInsights: React.FC<DashboardInsightsProps> = ({ showInsights }) => {
  const insights = useSelector(selectDashboardInsights);
  const { t } = useTranslation('budget');
  const fmt = useFormatMoney();

  const { totals, avgDaily, projectedTotal, burnVsPace, remainingPerDay, distribution } = insights;
  const { burn, pace } = burnVsPace;
  const { totalDays } = useSelector(selectMonthTiming);
  const normalDailySpend = totalDays > 0 ? insights.totals.totalAllocated / totalDays : 0;

  const barChartData: BarChartRow[] = [
    {
      category: t('bucketNames.needs') ?? 'Needs',
      allocated: totals.alloc.needs,
      spent: distribution.needs,
    },
    {
      category: t('bucketNames.wants') ?? 'Wants',
      allocated: totals.alloc.wants,
      spent: distribution.wants,
    },
    {
      category: t('bucketNames.savings') ?? 'Savings',
      allocated: totals.alloc.savings,
      spent: distribution.savings,
    },
  ];

  if (showInsights === 'distribution') return <StackedBarChart data={barChartData} />;

  return (
    <div className="cards-grid">
      <KpiCard
        title={t('kpi.avgDailySpend') ?? 'Avg daily spend'}
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
      <KpiCard title={t('kpi.projected') ?? 'Projected total'} value={fmt(projectedTotal)} />
      <KpiCard
        title={t('kpi.burnVsPace') ?? 'Burn vs. Pace'}
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
        title={t('kpi.remainingPerDay') ?? 'Remaining / day'}
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
