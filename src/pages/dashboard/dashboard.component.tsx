import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

import DonutChart from '../../components/charts/donut.component';
import { selectAuthUser } from '../../store/auth-store/auth.selectors';
import {
  selectBudgetDoc,
  selectBudgetMonth,
  selectBudgetTxns,
} from '../../store/budget-store/budget.selectors';
import Button from '../../components/button/button.component';
import DashboardCards from '../../components/dashboard-cards/dashboard-cards.component';
import AddTransaction from '../../components/modal/add-transaction-modal/add-transaction-modal.component';

import './dashboard.styles.scss';

const Dashboard: React.FC = () => {
  const user = useSelector(selectAuthUser);
  const budgetDoc = useSelector(selectBudgetDoc);
  const month = useSelector(selectBudgetMonth);
  const transactions = useSelector(selectBudgetTxns);
  const income = 2500;

  useEffect(() => {
    console.log('user', getFirstName(user?.displayName ?? ''));
    console.log('budget', budgetDoc, month);

    console.log('txns', transactions);
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
        <h1>Hi, {getFirstName(user?.displayName ?? '')} 👋</h1>
        <div className="total-income-container">
          <span className="total-income-lable">Total Income</span>
          <h2>€{budgetDoc?.income}</h2>
        </div>
        <div className="total-income-container">
          <span className="total-income-lable">Current month</span>
          <h2>{month}</h2>
        </div>
      </div>
      <section className="dashboard-donut-container">
        <div className="dashboard-donut">
          <DonutChart
            data={[
              { id: 'Needs', label: 'Needs', value: income * 0.5, color: 'var(--needs)' },
              { id: 'Wants', label: 'Wants', value: income * 0.3, color: 'var(--wants)' },
              { id: 'Savings', label: 'Savings', value: income * 0.2, color: 'var(--savings)' },
            ]}
          />
        </div>
        <div className="dashboard-cat-percentages">
          <div className="cat-percentage-line">
            <span className="dashboard-category">
              {(budgetDoc?.percents.needs ?? 0) * 100}% Needs
            </span>
            <span className="dashboard-category">€{budgetDoc?.allocations.needs}</span>
          </div>

          <div className="cat-percentage-line">
            <span className="dashboard-category">
              {(budgetDoc?.percents.wants ?? 0) * 100}% Wants
            </span>
            <span className="dashboard-category">€{budgetDoc?.allocations.wants}</span>
          </div>

          <div className="cat-percentage-line">
            <span className="dashboard-category">
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
      <section className="dashboard-cards-container">
        <DashboardCards />

        <AddTransaction />
      </section>
    </div>
  );
};

export default Dashboard;
