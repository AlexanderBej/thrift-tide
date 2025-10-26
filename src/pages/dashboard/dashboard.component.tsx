import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { selectAuthUser } from '../../store/auth-store/auth.selectors';
import {
  selectBudgetDoc,
  selectBudgetTxns,
  selectMonthTotalsByBucket,
  selectSpentByBucket,
} from '../../store/budget-store/budget.selectors';
import Button from '../../components/button/button.component';
import DashboardCards from '../../components/dashboard-cards/dashboard-cards.component';
import AddTransaction from '../../components/modal/add-transaction-modal/add-transaction-modal.component';
import DonutChart, { Item } from '../../components/charts/donut.component';
import { BUCKET_COLORS } from '../../api/types/bucket.types';
import { selectDashboardInsights } from '../../store/budget-store/budget-insights.selectors';
import DashboardInsights from '../../components/dashboard-insights/dashboard-insights.component';

import './dashboard.styles.scss';
import {
  makeSelectBucketBadges,
  selectBadges,
} from '../../store/budget-store/budget-badges.selectors';
import { BadgePills } from '../../components/badge-pills/badge-pills.component';

const fmt = (n: number | null | undefined, currency = '€') =>
  n == null ? '—' : `${currency}${n.toFixed(2)}`;

const Dashboard: React.FC = () => {
  const user = useSelector(selectAuthUser);
  const budgetDoc = useSelector(selectBudgetDoc);
  const spentByBucket = useSelector(selectSpentByBucket);
  const transactions = useSelector(selectBudgetTxns);
  const insights = useSelector(selectDashboardInsights);
  const monthTotalsByBucket = useSelector(selectMonthTotalsByBucket);
  const badges = useSelector(selectBadges);

  const items: Item[] = [
    {
      id: 'Needs',
      label: 'Needs',
      allocated: budgetDoc?.allocations.needs ?? 0,
      color: 'var(--needs-light)',
      used: spentByBucket.needs,
      strongColor: 'var(--needs)',
    },
    {
      id: 'Wants',
      label: 'Wants',
      allocated: budgetDoc?.allocations.wants ?? 0,
      color: 'var(--wants-light)',
      used: spentByBucket.wants,
      strongColor: 'var(--wants)',
    },
    {
      id: 'Savings',
      label: 'Savings',
      allocated: budgetDoc?.allocations.savings ?? 0,
      color: 'var(--savings-light)',
      used: spentByBucket.savings,
      strongColor: 'var(--savings)',
    },
  ];

  useEffect(() => {
    console.log('user', getFirstName(user?.displayName ?? ''));
    console.log('budget', budgetDoc);
    console.log('spentByBucket', spentByBucket);

    console.log('txns', transactions);
    console.log('insights', insights);
    console.log('monthTotalsByBucket', monthTotalsByBucket);
  });

  const getFirstName = (name: string | null) => {
    if (!name) return '';
    const names = name.split(' ');
    return names[0];
  };

  const handleEditPercentage = () => {
    console.log('edit percentages');
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <section className="dashboard-intro-card">
          <h1>Hi, {getFirstName(user?.displayName ?? '')} 👋</h1>
          <div className="total-income-container">
            <span className="total-income-lable">Total Income</span>
            <h2>{fmt(budgetDoc?.income)}</h2>
          </div>
          <div className="total-income-container">
            <span className="total-income-lable">Total Remaining</span>
            <h2>{fmt(insights.totals.totalRemaining)}</h2>
          </div>
        </section>
        <section className="dashboard-pie-card">
          <div className="dashboard-donut">
            <DonutChart data={items} />
          </div>
          <div className="dashboard-cat-percentages">
            <div className="cat-percentage-line">
              <span className="dashboard-category" style={{ color: BUCKET_COLORS.needs }}>
                {(budgetDoc?.percents.needs ?? 0) * 100}% Needs
              </span>
              <span className="dashboard-category">€{budgetDoc?.allocations.needs}</span>
            </div>

            <div className="cat-percentage-line">
              <span className="dashboard-category" style={{ color: BUCKET_COLORS.wants }}>
                {(budgetDoc?.percents.wants ?? 0) * 100}% Wants
              </span>
              <span className="dashboard-category">€{budgetDoc?.allocations.wants}</span>
            </div>

            <div className="cat-percentage-line">
              <span className="dashboard-category" style={{ color: BUCKET_COLORS.savings }}>
                {(budgetDoc?.percents.savings ?? 0) * 100}% Savings
              </span>
              <span className="dashboard-category">€{budgetDoc?.allocations.savings}</span>
            </div>

            <Button
              buttonType="neutral"
              customContainerClass="edit-percentage-btn"
              onClick={handleEditPercentage}
            >
              <span>Edit Percentages</span>
            </Button>
          </div>
        </section>
      </div>
      <section className="dashboard-cards-container">
        <BadgePills badges={badges} />

        <DashboardCards />
        <AddTransaction />
      </section>
      <div className="insights-container">
        <section className="kpi-cards-container">
          <h2>Insights</h2>
          <DashboardInsights income={budgetDoc?.income ?? 0} showInsights="kpi" />
        </section>

        <section className="distribution-container">
          <DashboardInsights income={budgetDoc?.income ?? 0} showInsights="distribution" />
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
