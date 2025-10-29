import React from 'react';

import DashboardCards from '../../components/dashboard-cards/dashboard-cards.component';

import './buckets.styles.scss';

const BucketsPage: React.FC = () => {
  return (
    <div className="buckets-page">
      <h2 className="card-header">Select a bucket</h2>
      <DashboardCards />
    </div>
  );
};

export default BucketsPage;
