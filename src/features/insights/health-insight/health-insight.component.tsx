import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { makeSelectBucketBadges, selectTotals } from '@store/budget-store';
import { Bucket } from '@api/types';
import { BadgePills, BucketName, ProgressBar } from '@components';
import { getCssVar } from '@shared/utils';
import { BucketInsightList } from '../bucket-insight';

import './health-insight.styles.scss';

function getScopedTotals(totals: any, bucket: Bucket) {
  const allocated = totals.alloc[bucket];
  const spent = totals.spent[bucket];
  const remaining = totals.remaining[bucket];

  const budgetLabelValue = (() => {
    if (totals.income) return totals.income[bucket];
    return allocated; // fallback: treat allocated as the relevant "budget"
  })();

  const progress = allocated > 0 ? Math.min(1, spent / allocated) : 0;

  const cssVarName =
    bucket === 'needs'
      ? '--needs'
      : bucket === 'wants'
        ? '--wants'
        : bucket === 'savings'
          ? '--savings'
          : '--color-primary';

  return {
    remaining,
    allocated,
    spent,
    budgetLabelValue,
    progress,
    cssVarName,
  };
}

interface BucketHealthProps {
  bucket: Bucket;
}

const HealthInsight: React.FC<BucketHealthProps> = ({ bucket }) => {
  const badges = useSelector(makeSelectBucketBadges(bucket as Bucket));
  const totals = useSelector(selectTotals);
  const scoped = useMemo(() => getScopedTotals(totals, bucket), [totals, bucket]);

  return (
    <div className="bucket-health">
      <div className="bucket-name-row">
        <BucketName bucket={bucket} />
        <BadgePills badges={badges} />
      </div>
      <ProgressBar progress={scoped.progress} color={getCssVar(scoped.cssVarName)} />
      <div className="bucket-insight-wrapper">
        <BucketInsightList bucket={bucket} />
      </div>
    </div>
  );
};

export default HealthInsight;
