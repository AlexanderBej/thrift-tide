import React from 'react';

import DashboardCards from '../../components/dashboard-cards/dashboard-cards.component';

import './categories.styles.scss';

const Categories: React.FC = () => {
  return (
    <div className="categories">
      <DashboardCards />
    </div>
  );
};

export default Categories;
