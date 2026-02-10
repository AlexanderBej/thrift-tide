import React from 'react';
import { useTranslation } from 'react-i18next';
import { IconType } from 'react-icons';
import { TbHomeStar } from 'react-icons/tb';
import { CiSquareQuestion } from 'react-icons/ci';
import { GiWantedReward } from 'react-icons/gi';
import { MdDataSaverOn } from 'react-icons/md';

import { TTIcon } from '@shared/ui';
import { Category } from '@api/types';

import './category-name.styles.scss';

interface CategoryNameProps {
  category: Category;
}

const CategoryName: React.FC<CategoryNameProps> = ({ category }) => {
  const { t } = useTranslation('budget');

  const getCatIcon = (c: string): IconType => {
    switch (c) {
      case 'needs':
        return TbHomeStar;
      case 'wants':
        return GiWantedReward;
      case 'savings':
        return MdDataSaverOn;
      default:
        return CiSquareQuestion;
    }
  };

  const getCatColor = (c: string): string => {
    switch (c) {
      case 'needs':
        return 'var(--needs)';
      case 'wants':
        return 'var(--wants)';
      case 'savings':
        return 'var(--savings)';
      default:
        return 'var(--needs)';
    }
  };

  return (
    <div className="category-name-cmp">
      <div className="category-icon-wrapper" style={{ background: getCatColor(category) }}>
        {category && <TTIcon icon={getCatIcon(category)} size={22} color="white" />}
      </div>
      <span className="category-value">{t(`taxonomy:categoryNames.${category}`)}</span>
    </div>
  );
};

export default CategoryName;
