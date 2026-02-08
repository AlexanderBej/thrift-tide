import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { DailyDotsChart } from '@shared/ui';
import { makeSelectCategoryDailySeriesNivo } from '@store/budget-store';
import { Category } from '@api/types';

import './category-pace.styles.scss';

interface CategoryPaceProps {
  category: Category;
}

const CategoryPace: React.FC<CategoryPaceProps> = ({ category }) => {
  const selectSeries = useMemo(() => makeSelectCategoryDailySeriesNivo(category), [category]);
  const data = useSelector(selectSeries);

  return <DailyDotsChart data={data} />;
};

export default CategoryPace;
