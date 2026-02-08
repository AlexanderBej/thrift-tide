import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { makeSelectCategoryPanel, selectBudgetDoc, selectTotals } from '@store/budget-store';
import { getCssVar } from '@shared/utils';

import './categories-progress-bar.styles.scss';

interface CategoryData {
  key: string;
  weight: number;
  spent: number;
  color: string;
}

function buildSpentGradient(categories: CategoryData[]) {
  // weight: 0..1, spent: 0..1
  const filledParts = categories.map((b) => ({
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

const CategoriesProgressBar: React.FC = () => {
  const selectNeedsPanel = useMemo(() => makeSelectCategoryPanel('needs'), []);
  const needsPanel = useSelector(selectNeedsPanel);
  const selectWantsPanel = useMemo(() => makeSelectCategoryPanel('wants'), []);
  const wantsPanel = useSelector(selectWantsPanel);
  const selectSavingsPanel = useMemo(() => makeSelectCategoryPanel('savings'), []);
  const savingsPanel = useSelector(selectSavingsPanel);

  const totals = useSelector(selectTotals);

  const doc = useSelector(selectBudgetDoc);

  const categoriesData: CategoryData[] = [
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

  const background = buildSpentGradient(categoriesData);
  const spentPercents = (totals.totalSpent / totals.totalAllocated) * 100;

  return (
    <div className="categories-progress-bar">
      {/* The fill is the full width, but painted with transparent after the filled portion */}
      <div
        className="categories-progress"
        style={{
          width: `${spentPercents}%`,
          background,
        }}
      />
    </div>
  );
};

export default CategoriesProgressBar;
