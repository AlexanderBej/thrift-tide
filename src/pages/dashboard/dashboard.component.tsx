import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { selectAuthUser } from '../../store/auth-store/auth.selectors';
import { selectSpentByBucket } from '../../store/budget-store/budget.selectors';
import Button from '../../components-ui/button/button.component';
import DoubleDonutChart, {
  DoubleDonutItem,
} from '../../components-ui/charts/double-donut.component';
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
import AddIncome from '../../components/add-income-modal/add-income-modal.component';

const Dashboard: React.FC = () => {
  const user = useSelector(selectAuthUser);
  const budgetDoc = useSelector(selectBudgetDoc);
  const spentByBucket = useSelector(selectSpentByBucket);
  const insights = useSelector(selectDashboardInsights);
  const badges = useSelector(selectBadges);

  const width = useWindowWidth();
  const isMobile = width < 480;

  const items: DoubleDonutItem[] = [
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
    console.log('budgetDoc', budgetDoc);
    console.log('insights', insights);
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
    <div className="dashboard-page">
      <section className="dashboard-intro-section">
        <h1 className="dashboard-intro-header">Hi, {getFirstName(user?.displayName ?? '')} 👋</h1>
        <div className="dashboard-income-wrapper">
          <div className="total-income-container">
            <span className="total-income-label">Total Income</span>
            <h2 className="total-income-value">{fmt(budgetDoc?.income)}</h2>
          </div>
          <div className="total-income-container">
            <span className="total-income-label">Total Remaining</span>
            <h2 className="total-income-value">{fmt(insights.totals.totalRemaining)}</h2>
          </div>
        </div>
      </section>
      <section className="dashboard-pie-section">
        <div className="dashboard-donut">
          <DoubleDonutChart data={items} height={isMobile ? 150 : 260} />
        </div>
        <div className="dashboard-cat-percentages">
          {/* <Button buttonType='primary' htmlType='button' onClick={} */}
          <AddIncome />
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
      <section className="dashboard-cards-section">
        <div className="dashboard-card-badges">
          <BadgePills badges={badges} />
        </div>

        <DashboardCards />
      </section>
      <section className="kpi-cards-section">
        <h2 className="card-header">Insights</h2>
        <DashboardInsights income={budgetDoc?.income ?? 0} showInsights="kpi" />
      </section>
      <section className="distribution-section">
        <DashboardInsights income={budgetDoc?.income ?? 0} showInsights="distribution" />
      </section>
    </div>
  );
};

export default Dashboard;
