import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { DailyDotsChart } from '@shared/ui';
import { makeSelectBucketDailySeriesNivo } from '@store/budget-store';
import { Bucket } from '@api/types';

import './bucket-pace.styles.scss';

interface BucketPaceProps {
  bucket: Bucket;
}

const BucketPace: React.FC<BucketPaceProps> = ({ bucket }) => {
  const selectSeries = useMemo(() => makeSelectBucketDailySeriesNivo(bucket), [bucket]);
  const data = useSelector(selectSeries);

  return <DailyDotsChart data={data} />;
};

export default BucketPace;
