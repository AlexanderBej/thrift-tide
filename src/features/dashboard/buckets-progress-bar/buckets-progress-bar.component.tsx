import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { makeSelectBucketPanel, selectBudgetDoc, selectTotals } from '@store/budget-store';
import { getCssVar } from '@shared/utils';

import './buckets-progress-bar.styles.scss';

interface BucketData {
  key: string;
  weight: number;
  spent: number;
  color: string;
}

function buildSpentGradient(buckets: BucketData[]) {
  // weight: 0..1, spent: 0..1
  const filledParts = buckets.map((b) => ({
    key: b.key,
    w: b.weight,
    f: b.weight * b.spent,
    color: b.color,
  }));

  // cumulative stops in [0..1]
  let acc = 0;
  const stops = [];

  for (const part of filledParts) {
    const start = acc;
    const end = acc + part.f;
    if (end > start) {
      stops.push(`${part.color} ${end * 100}%`);
    }
    acc = end;
  }

  // everything after filled is "empty"
  //   stops.push(`transparent ${acc * 100}% 100%`);

  return `linear-gradient(90deg, ${stops.join(', ')})`;
}

const BucketsProgressBar: React.FC = () => {
  const selectNeedsPanel = useMemo(() => makeSelectBucketPanel('needs'), []);
  const needsPanel = useSelector(selectNeedsPanel);
  const selectWantsPanel = useMemo(() => makeSelectBucketPanel('wants'), []);
  const wantsPanel = useSelector(selectWantsPanel);
  const selectSavingsPanel = useMemo(() => makeSelectBucketPanel('savings'), []);
  const savingsPanel = useSelector(selectSavingsPanel);

  const totals = useSelector(selectTotals);

  const doc = useSelector(selectBudgetDoc);

  const bucketsData: BucketData[] = [
    {
      key: 'needs',
      weight: doc?.percents.needs ?? 0,
      spent: needsPanel.spent / needsPanel.alloc,
      color: getCssVar('--needs'),
    },
    {
      key: 'wants',
      weight: doc?.percents.wants ?? 0,
      spent: wantsPanel.spent / wantsPanel.alloc,
      color: getCssVar('--wants'),
    },
    {
      key: 'savings',
      weight: doc?.percents.savings ?? 0,
      spent: savingsPanel.spent / savingsPanel.alloc,
      color: getCssVar('--savings'),
    },
  ];

  const background = buildSpentGradient(bucketsData);
  const spentPercents = (totals.totalSpent / totals.totalAllocated) * 100;

  return (
    <div className="buckets-progress-bar">
      {/* The fill is the full width, but painted with transparent after the filled portion */}
      <div
        className="buckets-progress"
        style={{
          width: `${spentPercents}%`,
          background,
        }}
      />
    </div>
  );
};

export default BucketsProgressBar;
