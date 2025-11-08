import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { BucketType } from '@api/types';
import { getCssVar } from '@shared/utils';
import { resolveCategory } from '@shared/utils';
import { useWindowWidth } from '@shared/hooks';
import { useFormatMoney } from '@shared/hooks';
import { Donut, DonutItem, TrendLineChart } from '@shared/ui';
import {
  makeSelectBucketPanel,
  selectMonthTiming,
  selectBadges,
  makeSelectBucketTrendsNivo,
  selectDashboardInsights,
  selectTopCategoriesOverall,
} from '@store/budget-store';
import { BadgePills, CategoryName, DashboardInsights, ForecastRow } from '@components';

import './insights.styles.scss';

const Insights: React.FC = () => {
  const { t } = useTranslation(['common', 'budget']);
  const fmt = useFormatMoney();

  const [mode] = useState<'cumulative' | 'daily'>('cumulative');
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

  const width = useWindowWidth();
  const isMobile = width < 480;

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
        <h2 className="card-header">
          {t('pageContent.insights.runOutForecast') ?? 'Run-out forecast'}
        </h2>
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
        <h2 className="card-header">{t('pageContent.insights.kpi') ?? 'KPIs'}</h2>
        <DashboardInsights showInsights="kpi" />
      </section>
      <section className="top-categories-sections">
        <h2 className="card-header">{t('budget:topCategories') ?? 'Top Categories'}</h2>
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
        <h2 className="card-header">
          {t('pageContent.insights.spentByBucket') ?? 'Spent by Bucket'}
        </h2>
        <div className="bucket-donuts">
          {[
            { bucket: bucketPanelNeeds, label: 'needs' },
            { bucket: bucketPanelWants, label: 'wants' },
            { bucket: bucketPanelSavings, label: 'savings' },
          ].map((bucket, index) => {
            return (
              <div className="bucket-donut" key={index}>
                <span className="bucket-donut-label">
                  {t('budget:totalSpent') ?? 'Total spent'} /{' '}
                  {t(`budget:bucketNames.${bucket.label}`) ?? bucket.label}
                </span>
                <Donut
                  height={isMobile ? 100 : 150}
                  data={getDonutData(bucket.bucket)}
                  percentage={getDonutPercentage(bucket.bucket)}
                />
              </div>
            );
          })}
        </div>
      </section>
      <section className="trends-section">
        <h2 className="card-header">{t('pageContent.insights.trends') ?? 'Trends'}</h2>
        <TrendLineChart series={trendLineChartData} />
      </section>
      <section className="legend-section">
        <h2 className="card-header">{t('pageContent.insights.legend') ?? 'Legend'}</h2>

        {trendLineChartData.map((data, index) => {
          return (
            <h3 key={index} className="legend-row" style={{ color: data.color }}>
              <span>
                {data.id.toLowerCase().includes('total')
                  ? data.id.toLowerCase().includes('pace')
                    ? t(`budget:pace`)
                    : 'Total'
                  : t(`budget:bucketNames.${data.id.toLowerCase()}`)}
              </span>
              <span>
                {!data.id.toLowerCase().includes('total')
                  ? fmt(insights.totals.alloc[data.id.toLowerCase() as BucketType])
                  : data.id.toLowerCase().includes('pace')
                    ? `${((insights.burnVsPace.pace ?? 0) * 100).toFixed(2)}%`
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
