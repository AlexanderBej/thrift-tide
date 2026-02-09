import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { useFormatMoney } from '@shared/hooks';
import { selectAuthUser } from '@store/auth-store';
import {
  selectDashboardInsights,
  selectSmartDashboardInsight,
  selectBudgetDoc,
  selectTopExpenseGroupsOverall,
} from '@store/budget-store';
import { ExpenseGroupName } from '@components';
import { resolveExpenseGroup } from '@shared/utils';
import { selectSettingsAppTheme, selectSettingsCurrency } from '@store/settings-store';
import { CategoryCards, CategoriesProgressBar, SmartInsightCard } from 'features';
import { Insight } from '@api/models';
import { InsightTone } from '@api/types';
import { PeriodWidget } from '@widgets';

import './dashboard.styles.scss';

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
  const { t } = useTranslation(['common', 'budget', 'taxonomy']);
  const fmtMoney = useFormatMoney();

  const user = useSelector(selectAuthUser);
  const currency = useSelector(selectSettingsCurrency);
  const insights = useSelector(selectDashboardInsights);
  const doc = useSelector(selectBudgetDoc);
  const topExpenseGroups = useSelector(selectTopExpenseGroupsOverall);
  const smartInsights = useSelector(selectSmartDashboardInsight) as Insight[];
  const theme = useSelector(selectSettingsAppTheme);

  const { headerInsight } = pickHeaderInsight(smartInsights);

  const categories = [
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
        <PeriodWidget isDashboard />
        <span>{currency}</span>
      </div>
      <h1 className="hi-header">
        {t('hi') ?? 'Hi'}, {getFirstName(user?.displayName ?? '')} 👋
      </h1>
      {isIncomeSet && (
        <>
          <h2 className="remaining-heading">
            {t('budget:headerRemaining', { remaining: fmtMoney(insights.totals.totalRemaining) })}
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

      <section className="tt-section category-cards">
        {categories.map((cat, index) => {
          return (
            <div
              key={index}
              className={`category-card category-card__${cat.key}`}
              style={{ width: `${cat.percent * 100}%` }}
            >
              <div className="category-title">
                <span className="category-key">{t(`taxonomy:categoryNames.${cat.key}`)}</span>
                <span className={`category-percent-${cat.key}`}>
                  {Math.round(cat.percent * 100)}%
                </span>
              </div>
              <div style={{ height: 50 }} />
              <div className="total">{cat.total}</div>
            </div>
          );
        })}

        <div className="progress-bar">
          <CategoriesProgressBar />
        </div>
      </section>

      {isIncomeSet && (
        <>
          <section className="tt-section">
            <CategoryCards />
          </section>

          <section className="tt-section">
            <h3 className="tt-section-header">{t('budget:topExpGroups')}</h3>
            <ul className={`exp-groups-list exp-groups-list__${theme}`}>
              {topExpenseGroups.map((eg, index) => {
                const fullEG = resolveExpenseGroup(eg.expGroup);
                return (
                  <li className="top-exp-groups-item" key={index}>
                    <ExpenseGroupName expenseGroup={fullEG} />
                    <strong>{eg.total}</strong>
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
