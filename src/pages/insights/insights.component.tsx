import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { Bucket, BucketType } from '@api/types';
import { resolveCategory } from '@shared/utils';
import { useFormatMoney } from '@shared/hooks';
import { EmblaCarousel } from '@shared/ui';
import {
  makeSelectBucketPanel,
  selectTopCategoriesOverall,
  selectSmartDashboardInsight,
} from '@store/budget-store';
import { CategoryName, ProgressBar } from '@components';
import { Insight } from '@api/models';
import { HealthInsight, SmartInsightCard } from 'features';

import './insights.styles.scss';

const Insights: React.FC = () => {
  const fmt = useFormatMoney();

  const selectPanelNeeds = useMemo(() => makeSelectBucketPanel(BucketType.NEEDS), []);
  const selectPanelWants = useMemo(() => makeSelectBucketPanel(BucketType.WANTS), []);
  const selectPanelSavings = useMemo(() => makeSelectBucketPanel(BucketType.SAVINGS), []);
  const bucketPanelNeeds = useSelector(selectPanelNeeds);
  const bucketPanelWants = useSelector(selectPanelWants);
  const bucketPanelSavings = useSelector(selectPanelSavings);

  const topCategories = useSelector(selectTopCategoriesOverall);

  const smartInsights = useSelector(selectSmartDashboardInsight) as Insight[];

  const getBucketProgress = (bucket: Bucket, catTotal: number) => {
    const bucketPanel =
      bucket === 'needs'
        ? bucketPanelNeeds
        : bucket === 'wants'
          ? bucketPanelWants
          : bucketPanelSavings;
    return catTotal / bucketPanel.alloc;
  };

  return (
    <div className="insights-page">
      <EmblaCarousel showDots>
        {smartInsights.map((insight) => (
          <SmartInsightCard key={insight.id} insight={insight} />
        ))}
      </EmblaCarousel>

      <section className="tt-section">
        <h3 className="tt-section-header">Buckets health</h3>
        {[BucketType.NEEDS, BucketType.WANTS, BucketType.SAVINGS].map((bucket, index) => (
          <div className="health-wrapper" key={index}>
            <HealthInsight bucket={bucket} />
          </div>
        ))}
      </section>

      <section className="tt-section">
        <h3 className="tt-section-header">What's driving your spending</h3>
        <ul className="top-spenders-list">
          {topCategories.map((cat, index) => {
            const fullCat = resolveCategory(cat.category);

            return (
              <li className="top-spender" key={index}>
                <div className="spender-row">
                  <CategoryName category={fullCat} />
                  <strong>{fmt(cat.total)}</strong>
                </div>
                <div className="spender-bar">
                  <ProgressBar
                    progress={getBucketProgress(cat.bucket, cat.total)}
                    color={fullCat.color}
                  />
                  <span className="spender-percent">
                    {Number(getBucketProgress(cat.bucket, cat.total) * 100).toFixed(0)}% of{' '}
                    {cat.bucket}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
};

export default Insights;
