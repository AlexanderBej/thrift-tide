import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { useFormatMoney } from '@shared/hooks';
import { selectAuthUser } from '@store/auth-store';
import {
  selectDashboardInsights,
  selectBudgetMonth,
  selectTopCategoriesOverall,
  selectSmartDashboardInsight,
  selectBudgetDoc,
} from '@store/budget-store';
import { CategoryName } from '@components';
import { formatMonth, resolveCategory } from '@shared/utils';
import { selectSettingsCurrency } from '@store/settings-store';
import { BucketCards, BucketsProgressBar, SmartInsightCard, SmartInsightChip } from 'features';
import { Insight } from '@api/models';
import { InsightTone } from '@api/types';

import './dashboard.styles.scss';
import { PeriodWidget } from '@widgets';

const pickHeaderInsight = (insights: Insight[]) => {
  const findIndexByTone = (tone: InsightTone) => insights.findIndex((i) => i.tone === tone);

  const mutedIdx = findIndexByTone('muted');
  const successIdx = findIndexByTone('success');

  let headerIndex = -1;

  if (mutedIdx !== -1) headerIndex = mutedIdx;
  else if (successIdx !== -1) headerIndex = successIdx;
  else headerIndex = insights.length ? 0 : -1;

  const headerInsight = headerIndex !== -1 ? insights[headerIndex] : insights[0];

  const listInsights = insights.filter((_, idx) => idx !== headerIndex).slice(0, 3);

  return { headerInsight, listInsights };
};

const Dashboard: React.FC = () => {
  const { t } = useTranslation(['common', 'budget']);
  const fmtMoney = useFormatMoney();

  const user = useSelector(selectAuthUser);
  const month = useSelector(selectBudgetMonth);
  const currency = useSelector(selectSettingsCurrency);
  const insights = useSelector(selectDashboardInsights);
  const doc = useSelector(selectBudgetDoc);
  const topCategories = useSelector(selectTopCategoriesOverall);
  const smartInsights = useSelector(selectSmartDashboardInsight) as Insight[];

  const { headerInsight } = pickHeaderInsight(smartInsights);

  const buckets = [
    {
      key: 'needs',
      percent: doc?.percents.needs ?? 0,
      total: insights.totals.alloc.needs,
    },
    {
      key: 'wants',
      percent: doc?.percents.wants ?? 0,
      total: insights.totals.alloc.wants,
    },
    {
      key: 'savings',
      percent: doc?.percents.savings ?? 0,
      total: insights.totals.alloc.savings,
    },
  ];

  const getFirstName = (name: string | null) => {
    if (!name) return '';
    const names = name.split(' ');
    return names[0];
  };

  const isIncomeSet = !!doc?.income;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <PeriodWidget />
        <span>&bull;</span>
        <span>{currency}</span>
      </div>
      <h1 className="hi-header">
        {t('hi') ?? 'Hi'}, {getFirstName(user?.displayName ?? '')} 👋
      </h1>
      {isIncomeSet && (
        <>
          <h2 className="remaining-heading">
            You have {fmtMoney(insights.totals.totalRemaining)} left
          </h2>
          <div className="budget-stats-line">
            <span>
              {t('budget:budget') ?? 'Budget'}: {insights.totals.totalAllocated}
            </span>
            <span>
              {t('budget:spent') ?? 'Spent'}: {insights.totals.totalSpent}
            </span>
          </div>
        </>
      )}

      <section className="smart-insight-section">
        <SmartInsightCard insight={headerInsight} showCta={true} />
      </section>

      <section className="tt-section bucket-cards">
        {buckets.map((bucket, index) => {
          return (
            <div
              key={index}
              className={`bucket-card bucket-card__${bucket.key}`}
              style={{ width: `${bucket.percent * 100}%` }}
            >
              <div className="bucket-title">
                <span className="bucket-key">{bucket.key}</span>
                <span className={`bucket-percent-${bucket.key}`}>
                  {Math.round(bucket.percent * 100)}%
                </span>
              </div>
              <div style={{ height: 50 }} />
              <div className="total">{bucket.total}</div>
            </div>
          );
        })}

        <div className="progress-bar">
          <BucketsProgressBar />
        </div>
      </section>

      {isIncomeSet && (
        <>
          <section className="tt-section">
            <BucketCards />
          </section>

          <section className="tt-section">
            <h3 className="tt-section-header">{t('budget:topCategories') ?? 'Top Categories'}</h3>
            <ul className="categories-list">
              {topCategories.map((cat, index) => {
                const fullCat = resolveCategory(cat.category);
                return (
                  <li className="top-cat-item" key={index}>
                    <CategoryName category={fullCat} />
                    <strong>{cat.total}</strong>
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      )}
    </div>
  );
};

export default Dashboard;
