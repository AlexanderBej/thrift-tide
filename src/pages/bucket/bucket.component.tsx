import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { Bucket, BUCKET_COLORS, BUCKET_ICONS, BucketType } from '@api/types';
import { resolveCategory, enumerateDatesUTC } from '@shared/utils';
import { useWindowWidth } from '@shared/hooks';
import { useFormatMoney } from '@shared/hooks';
import { BarChartRow, Breadcrumbs, Donut, DonutItem, StackedBarChart, TTIcon } from '@shared/ui';
import {
  makeSelectBucketBadges,
  makeSelectBucketPanel,
  makeSelectCategoryView,
  selectBudgetLoadStatus,
  selectDailySpendQuery,
  selectDashboardInsights,
  selectMonthTiming,
} from '@store/budget-store';
import {
  BadgePills,
  CategoryName,
  ProgressBar,
  SpendingTimelineBar,
  TransactionRow,
} from '@components';

import './bucket.styles.scss';

const BucketPage: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const { t } = useTranslation(['common', 'budget']);
  const fmt = useFormatMoney();

  const status = useSelector(selectBudgetLoadStatus);
  const badges = useSelector(makeSelectBucketBadges(type as Bucket));
  const insights = useSelector(selectDashboardInsights);
  const { periodStart, periodEnd } = useSelector(selectMonthTiming);
  const selectPanel = useMemo(() => makeSelectBucketPanel(type as Bucket), [type]);
  const bucketPanel = useSelector(selectPanel);
  const selectView = useMemo(() => makeSelectCategoryView(type as Bucket), [type]);
  const view = useSelector(selectView);
  const getSpendOn = useSelector(selectDailySpendQuery);

  const width = useWindowWidth();
  const isMobile = width < 480;

  if (status === 'loading' || !view) {
    return <div style={{ padding: 24 }}>Loading…</div>;
  }

  const title = type === 'needs' ? 'Needs' : type === 'wants' ? 'Wants' : 'Savings';

  const donutItems: DonutItem[] = view.byCategory.map((entry) => {
    const cat = resolveCategory(entry.category);
    return {
      id: cat.value,
      label: cat.label,
      value: entry.total,
      color: cat.color,
    };
  });

  const normalDailySpend = (insights.totals.totalAllocated ?? 0) / 30;

  const daysArray = enumerateDatesUTC(periodStart, periodEnd);

  const barChartData: BarChartRow[] = daysArray.map((day) => {
    const value = getSpendOn(day, type as Bucket);
    return {
      category: day.getDate().toString(),
      allocated: normalDailySpend,
      spent: value as number,
    };
  });

  const icon =
    type === BucketType.NEEDS
      ? BUCKET_ICONS.needs
      : type === BucketType.WANTS
        ? BUCKET_ICONS.wants
        : BUCKET_ICONS.savings;

  return (
    <div className="bucket-page">
      <Breadcrumbs />
      <header className="bucket-page-header">
        <div
          className="bucket-icon-wrapper"
          style={{ backgroundColor: BUCKET_COLORS[type as BucketType] }}
        >
          <TTIcon icon={icon} color="white" />
        </div>
        <h2>{t(`budget:bucketNames.${title.toLowerCase()}`)}</h2>
      </header>
      <div className="bucket-page-grid">
        <section
          className={`bucket-summary-section bucket-summary-section__${title.toLowerCase()}`}
        >
          <div className="bucket-summary-line">
            <div className="bucket-summary">
              {t('budget:allocated') ?? 'Allocated'}: <strong>{fmt(view.allocated)}</strong>
            </div>
            <div className="bucket-summary bucket-middle">
              {t('budget:spent') ?? 'Spent'}: <strong>{fmt(view.spent)}</strong>
            </div>
            <div className="bucket-summary bucket-last">
              {t('budget:remaining') ?? 'Remaining'}: <strong>{fmt(view.remaining)}</strong>
            </div>
          </div>
          <ProgressBar progress={view.progress} />
          <div className="cat-summary-badges">
            <BadgePills badges={badges} />
          </div>
        </section>
        <section className="top-categories-section">
          <h2 className="card-header">{t('budget:topCategories') ?? 'Top categories'}</h2>
          {view.byCategory.length === 0 ? (
            <div className="missing-items">
              {t('budget:noTransactions') ?? 'No transactions yet.'}
            </div>
          ) : (
            <ul className="top-categories-list">
              {view.byCategory.map((row) => {
                const cat = resolveCategory(row.category);
                return (
                  <li key={row.category} className="categories-item">
                    <CategoryName category={cat} />
                    <strong>{fmt(row.total)}</strong>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
        <section className="bucket-chart-section">
          <Donut height={isMobile ? 130 : 260} data={donutItems} showTooltip={false} />
        </section>
        <section className="bucket-insights-section">
          <h2 className="card-header">{t('pages.insights') ?? 'Insights'}</h2>

          <StackedBarChart
            height={isMobile ? 180 : 260}
            fontSize={isMobile ? 9 : 12}
            data={barChartData}
          />
          <SpendingTimelineBar
            periodStart={periodStart}
            periodEnd={periodEnd}
            runOutDate={bucketPanel.runOutDate}
          />
        </section>
        <section className="bucket-transactions-section">
          <h2 className="card-header">{t('pages.transactions') ?? 'Transactions'}</h2>
          {view.items.length === 0 ? (
            <div className="missing-items">
              {t('pageContent.bucket.noTrans')} {title.toLowerCase()}.
            </div>
          ) : (
            <div>
              {view.items.map((t) => {
                const cat = resolveCategory(t.category);

                return <TransactionRow key={t.id} source="category" txn={t} category={cat} />;
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default BucketPage;
