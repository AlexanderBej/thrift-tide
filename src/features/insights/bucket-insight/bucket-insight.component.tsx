import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { useResolvedInsight } from '@shared/hooks';
import { selectBucketInsights } from '@store/budget-store';
import { Bucket, BucketType } from '@api/types';
import { SmartInsightChip } from '../smart-insight-chip';

interface BucketInsightListProps {
  bucket: Bucket | 'all';
}

const BucketInsightList: React.FC<BucketInsightListProps> = ({ bucket }) => {
  const navigate = useNavigate();
  const { needs, wants, savings } = useSelector(selectBucketInsights);
  const { resolve } = useResolvedInsight();

  const items =
    bucket === BucketType.NEEDS
      ? [needs]
      : bucket === BucketType.WANTS
        ? [wants]
        : bucket === BucketType.SAVINGS
          ? [savings]
          : [needs, wants, savings];

  const resolvedItems = items.map((i) => ({ i, text: resolve(i) }));

  return (
    <div className="bucket-insights">
      {resolvedItems.map(({ i }) => (
        <SmartInsightChip key={i.id} insight={i} showCta={false} />
      ))}
    </div>
  );
};

export default BucketInsightList;
