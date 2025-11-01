import React from 'react';
import { useTranslation } from 'react-i18next';

import DashboardCards from '../../components/dashboard-cards/dashboard-cards.component';

import './buckets.styles.scss';

const BucketsPage: React.FC = () => {
  const { t } = useTranslation('common');

  return (
    <div className="buckets-page">
      <h2 className="card-header">{t('pageContent.buckets.header') ?? 'Select a bucket'}</h2>
      <DashboardCards />
    </div>
  );
};

export default BucketsPage;
