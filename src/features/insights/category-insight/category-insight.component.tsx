import React from 'react';
import { useSelector } from 'react-redux';

import { useResolvedInsight } from '@shared/hooks';
import { selectCategoryInsights } from '@store/budget-store';
import { Category, CategoryType } from '@api/types';
import { SmartInsightChip } from '../smart-insight-chip';

interface CategoryInsightListProps {
  category: Category | 'all';
}

const CategoryInsightList: React.FC<CategoryInsightListProps> = ({ category }) => {
  const { needs, wants, savings } = useSelector(selectCategoryInsights);
  const { resolve } = useResolvedInsight();

  const items =
    category === CategoryType.NEEDS
      ? [needs]
      : category === CategoryType.WANTS
        ? [wants]
        : category === CategoryType.SAVINGS
          ? [savings]
          : [needs, wants, savings];

  const resolvedItems = items.map((i) => ({ i, text: resolve(i) }));

  return (
    <div className="category-insights">
      {resolvedItems.map(({ i }) => (
        <SmartInsightChip key={i.id} insight={i} showCta={false} />
      ))}
    </div>
  );
};

export default CategoryInsightList;
