import React from 'react';
import { useSelector } from 'react-redux';

import { selectAuthUser } from '../../store/auth-store/auth.selectors';
import { selectSpentByBucket } from '../../store/budget-store/budget.selectors';
import Button from '../../components-ui/button/button.component';
import DonutChart, { Item } from '../../components-ui/charts/donut.component';
import { BUCKET_COLORS } from '../../api/types/bucket.types';
import { selectDashboardInsights } from '../../store/budget-store/budget-insights.selectors';
import DashboardInsights from '../../components/dashboard-insights/dashboard-insights.component';
import { selectBadges } from '../../store/budget-store/budget-badges.selectors';
import { BadgePills } from '../../components/badge-pills/badge-pills.component';
import { useWindowWidth } from '../../utils/window-width.hook';
import { fmt } from '../../utils/format-data.util';
import { selectBudgetDoc } from '../../store/budget-store/budget.selectors.base';
import DashboardCards from '../../components/dashboard-cards/dashboard-cards.component';

import './dashboard.styles.scss';

const Dashboard: React.FC = () => {
  const user = useSelector(selectAuthUser);
  const budgetDoc = useSelector(selectBudgetDoc);
  const spentByBucket = useSelector(selectSpentByBucket);
  const insights = useSelector(selectDashboardInsights);
  const badges = useSelector(selectBadges);

  const width = useWindowWidth();
  const isMobile = width < 480;

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
          <h1 className="dashboard-intro-header">Hi, {getFirstName(user?.displayName ?? '')} 👋</h1>
          <div className="dashboard-income-wrapper">
            <div className="total-income-container">
              <span className="total-income-lable">Total Income</span>
              <h2 className="total-income-value">{fmt(budgetDoc?.income)}</h2>
            </div>
            <div className="total-income-container">
              <span className="total-income-lable">Total Remaining</span>
              <h2 className="total-income-value">{fmt(insights.totals.totalRemaining)}</h2>
            </div>
          </div>
        </section>
        <section className="dashboard-pie-card">
          <div className="dashboard-donut">
            <DonutChart data={items} height={isMobile ? 150 : 260} />
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
      </section>
      <div className="insights-container">
        <section className="kpi-cards-container">
          <h2 className="card-h2">Insights</h2>
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
