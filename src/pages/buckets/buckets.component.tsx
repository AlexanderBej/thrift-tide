import React from 'react';
// import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { selectBucketsTopInsights } from '@store/budget-store';
import { InfoBlock } from '@shared/ui';

import './buckets.styles.scss';
import { BucketInfo, BucketsHealth } from 'features';

const BucketsPage: React.FC = () => {
  // const { t } = useTranslation('common');

  const insights = useSelector(selectBucketsTopInsights);

  return (
    <div className="buckets-page">
      <InfoBlock>
        <span>Track the health of your buckets and adjust your allocations as needed.</span>
      </InfoBlock>

      <section className="tt-section">
        <BucketsHealth />
      </section>
      {/* <h2 className="card-header">{t('pageContent.buckets.header') ?? 'Select a bucket'}</h2> */}
      <section className="tt-section">
        <BucketInfo />
      </section>
    </div>
  );
};

export default BucketsPage;
