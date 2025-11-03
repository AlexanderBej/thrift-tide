import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

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
import { selectBudgetDoc } from '../../store/budget-store/budget.selectors.base';
import DashboardCards from '../../components/dashboard-cards/dashboard-cards.component';
import AddIncome from '../../components/add-income-modal/add-income-modal.component';
import { useFormatMoney } from '../../utils/format-money.hook';

import './dashboard.styles.scss';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['common', 'budget']);
  const fmt = useFormatMoney();

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

  const getFirstName = (name: string | null) => {
    if (!name) return '';
    const names = name.split(' ');
    return names[0];
  };

  return (
    <div className="dashboard-page">
      <section className="dashboard-intro-section">
        <h1 className="dashboard-intro-header">
          {t('hi') ?? 'Hi'}, {getFirstName(user?.displayName ?? '')} 👋
        </h1>
        <div className="dashboard-income-wrapper">
          <div className="total-income-container">
            <span className="total-income-label">{t('budget:income') ?? 'Income'}</span>
            <h2 className="total-income-value">{fmt(budgetDoc?.income)}</h2>
          </div>
          <div className="total-income-container">
            <span className="total-income-label">
              {t('budget:totalRemaining') ?? 'Total remaining'}
            </span>
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
              {(budgetDoc?.percents.needs ?? 0) * 100}% {t('budget:bucketNames.needs') ?? 'Needs'}
            </span>
            <span className="dashboard-category">{fmt(budgetDoc?.allocations.needs)}</span>
          </div>

          <div className="cat-percentage-line">
            <span className="dashboard-category" style={{ color: BUCKET_COLORS.wants }}>
              {(budgetDoc?.percents.wants ?? 0) * 100}% {t('budget:bucketNames.wants') ?? 'Wants'}
            </span>
            <span className="dashboard-category">{fmt(budgetDoc?.allocations.wants)}</span>
          </div>

          <div className="cat-percentage-line">
            <span className="dashboard-category" style={{ color: BUCKET_COLORS.savings }}>
              {(budgetDoc?.percents.savings ?? 0) * 100}%{' '}
              {t('budget:bucketNames.savings') ?? 'Savings'}
            </span>
            <span className="dashboard-category">{fmt(budgetDoc?.allocations.savings)}</span>
          </div>

          <Button
            buttonType="neutral"
            customContainerClass="edit-percentage-btn"
            onClick={() => navigate('/settings')}
          >
            <span>
              {t('actions.edit') ?? 'Edit'} {t('pageContent.percentages') ?? 'percentages'}
            </span>
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
        <h2 className="card-header">{t('pages.insights') ?? 'Insights'}</h2>
        <DashboardInsights showInsights="kpi" />
      </section>
      <section className="distribution-section">
        <DashboardInsights showInsights="distribution" />
      </section>
    </div>
  );
};

export default Dashboard;
