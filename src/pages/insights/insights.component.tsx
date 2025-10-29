import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import {
  makeSelectBucketPanel,
  makeSelectBucketTrendsNivo,
  selectDashboardInsights,
} from '../../store/budget-store/budget-insights.selectors';
import { BucketType } from '../../api/types/bucket.types';
import { selectMonthTiming } from '../../store/budget-store/budget-period.selectors';
import { Donut, DonutItem } from '../../components-ui/charts/donut.component';
import { getCssVar } from '../../utils/style-variable.util';
import { BadgePills } from '../../components/badge-pills/badge-pills.component';
import { selectBadges } from '../../store/budget-store/budget-badges.selectors';
import TrendLineChart from '../../components-ui/charts/trend-line.component';
import ForecastRow from '../../components/forecast-row/forecast-row.component';
import DashboardInsights from '../../components/dashboard-insights/dashboard-insights.component';

import './insights.styles.scss';
import { selectTopCategoriesOverall } from '../../store/budget-store/budget.selectors';
import { resolveCategory } from '../../utils/category-options.util';
import CategoryName from '../../components/category-name/category-name.component';
import { fmt } from '../../utils/format-data.util';

const Insights: React.FC = () => {
  const [mode, setMode] = useState<'cumulative' | 'daily'>('cumulative');
  const selectPanelNeeds = useMemo(() => makeSelectBucketPanel(BucketType.NEEDS), []);
  const selectPanelWants = useMemo(() => makeSelectBucketPanel(BucketType.WANTS), []);
  const selectPanelSavings = useMemo(() => makeSelectBucketPanel(BucketType.SAVINGS), []);
  const bucketPanelNeeds = useSelector(selectPanelNeeds);
  const bucketPanelWants = useSelector(selectPanelWants);
  const bucketPanelSavings = useSelector(selectPanelSavings);
  const { periodStart, periodEnd } = useSelector(selectMonthTiming);
  const badges = useSelector(selectBadges);
  const selectTrends = useMemo(
    () => makeSelectBucketTrendsNivo({ mode, includeTotal: true, includePace: true }),
    [mode],
  );
  const trendLineChartData = useSelector(selectTrends);
  const insights = useSelector(selectDashboardInsights);
  const topCategories = useSelector(selectTopCategoriesOverall);

  console.log('bucketPanelNeeds', bucketPanelNeeds);
  console.log('bucketPanelWants', bucketPanelWants);
  console.log('bucketPanelSavings', bucketPanelSavings);
  console.log('trendLineChartData', trendLineChartData);

  const getDonutData = (bucketPanel: any): DonutItem[] => {
    const spentPct = getSpentPct(bucketPanel);

    return [
      {
        id: 'progress',
        label: 'Spent',
        value: bucketPanel.spent,
        color: getCssVar(`--${getPctColor(spentPct)}`),
      },
      {
        id: 'remaining',
        label: 'Remaining',
        value: bucketPanel.remaining,
        color: getCssVar(`--${getPctColor(spentPct)}-light`),
      },
    ];
  };

  const getSpentPct = (bucketPanel: any) => {
    return (bucketPanel.spent / bucketPanel.alloc) * 100;
  };

  const getPctColor = (pct: number) => {
    if (pct > 70) return 'warning';
    else if (pct > 95) return 'danger';
    return 'success';
  };

  const getDonutPercentage = (bucketPanel: any) => {
    const pct = getSpentPct(bucketPanel);

    console.log('getDonutPercentage', pct, getPctColor(pct));

    return {
      value: pct,
      color: getCssVar(`--${getPctColor(pct)}`),
    };
  };

  return (
    <div className="insights-page">
      <section className="badge-card-section">
        <BadgePills badgeType="card" badges={badges} />
      </section>
      <section className="run-out-section">
        <h2 className="card-header">Run-out forecast</h2>
        <ForecastRow
          periodStart={periodStart}
          periodEnd={periodEnd}
          runOutDate={bucketPanelNeeds.runOutDate}
          daysToZero={bucketPanelNeeds.daysToZero}
          bucket="Needs"
        />
        <ForecastRow
          periodStart={periodStart}
          periodEnd={periodEnd}
          runOutDate={bucketPanelWants.runOutDate}
          daysToZero={bucketPanelWants.daysToZero}
          bucket="Wants"
        />
        <ForecastRow
          periodStart={periodStart}
          periodEnd={periodEnd}
          runOutDate={bucketPanelSavings.runOutDate}
          daysToZero={bucketPanelSavings.daysToZero}
          bucket="Savings"
        />
      </section>
      <section className="avg-insights-section">
        <h2 className="card-header">KPIs</h2>
        <DashboardInsights income={insights.totals.totalAllocated ?? 0} showInsights="kpi" />
      </section>
      <section className="top-categories-sections">
        <h2 className="card-header">Top categories</h2>
        <ul className="top-categories-list">
          {topCategories.map((cat, index) => {
            const fullCat = resolveCategory(cat.category);
            return (
              <li className="top-cat-item" key={index}>
                <CategoryName category={fullCat} />
                <strong>{fmt(cat.total)}</strong>
              </li>
            );
          })}
        </ul>
      </section>
      <section className="bucket-spend-section">
        <h2 className="card-header">Spent by bucket</h2>
        <div className="bucket-donuts">
          <div className="bucket-donut">
            <span className="bucket-donut-label">Total spent / needs</span>
            <Donut
              height={150}
              data={getDonutData(bucketPanelNeeds)}
              percentage={getDonutPercentage(bucketPanelNeeds)}
            />
          </div>
          <div className="bucket-donut">
            <span className="bucket-donut-label">Total spent / wants</span>
            <Donut
              height={150}
              data={getDonutData(bucketPanelWants)}
              percentage={getDonutPercentage(bucketPanelWants)}
            />
          </div>
          <div className="bucket-donut">
            <span className="bucket-donut-label">Total spent / savings</span>
            <Donut
              height={150}
              data={getDonutData(bucketPanelSavings)}
              percentage={getDonutPercentage(bucketPanelSavings)}
            />
          </div>
        </div>
      </section>
      <section className="trends-section">
        <h2 className="card-header">Trends</h2>
        <TrendLineChart series={trendLineChartData} />
      </section>
      <section className="legend-section">
        <h2 className="card-header">Legend</h2>

        {trendLineChartData.map((data, index) => {
          return (
            <h3 key={index} className="legend-row" style={{ color: data.color }}>
              <span>{data.id}</span>
              <span>
                {!data.id.toLowerCase().includes('total')
                  ? fmt(insights.totals.alloc[data.id.toLowerCase() as BucketType])
                  : data.id.toLowerCase().includes('pace')
                    ? `${(insights.burnVsPace.pace ?? 0) * 100}%`
                    : fmt(insights.totals.totalAllocated)}
              </span>
            </h3>
          );
        })}
      </section>
    </div>
  );
};

export default Insights;
