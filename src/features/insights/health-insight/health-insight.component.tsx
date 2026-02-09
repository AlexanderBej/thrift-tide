import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import clsx from 'clsx';

import { makeSelectCategoryBadges, selectTotals } from '@store/budget-store';
import { Category } from '@api/types';
import { BadgePills, CategoryName, ProgressBar } from '@components';
import { getCssVar } from '@shared/utils';
import { CategoryInsightList } from '../category-insight';
import { selectSettingsAppTheme } from '@store/settings-store';

import './health-insight.styles.scss';

function getScopedTotals(totals: any, category: Category) {
  const allocated = totals.alloc[category];
  const spent = totals.spent[category];
  const remaining = totals.remaining[category];

  const budgetLabelValue = (() => {
    if (totals.income) return totals.income[category];
    return allocated; // fallback: treat allocated as the relevant "budget"
  })();

  const progress = allocated > 0 ? Math.min(1, spent / allocated) : 0;

  const cssVarName =
    category === 'needs'
      ? '--needs'
      : category === 'wants'
        ? '--wants'
        : category === 'savings'
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

interface CategoryHealthProps {
  category: Category;
}

const HealthInsight: React.FC<CategoryHealthProps> = ({ category }) => {
  const badges = useSelector(makeSelectCategoryBadges(category as Category));
  const totals = useSelector(selectTotals);
  const scoped = useMemo(() => getScopedTotals(totals, category), [totals, category]);
  const theme = useSelector(selectSettingsAppTheme);

  return (
    <div className={clsx(`category-health category-health__${theme}`)}>
      <div className="category-name-row">
        <CategoryName category={category} />
        <BadgePills badges={badges} />
      </div>
      <ProgressBar progress={scoped.progress} color={getCssVar(scoped.cssVarName)} />
      <div className="category-insight-wrapper">
        <CategoryInsightList category={category} />
      </div>
    </div>
  );
};

export default HealthInsight;
