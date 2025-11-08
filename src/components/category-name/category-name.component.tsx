import React from 'react';
import { useTranslation } from 'react-i18next';

import { CategoryOption } from '@api/models';
import { TTIcon } from '@shared/ui';

import './category-name.styles.scss';

interface CategoryNameProps {
  category: CategoryOption;
}

const CategoryName: React.FC<CategoryNameProps> = ({ category }) => {
  const { t } = useTranslation('budget');

  return (
    <div className="category-row">
      <div className="category-icon-wrapper" style={{ backgroundColor: category.color }}>
        <TTIcon icon={category.icon} color="white" size={18} />
      </div>
      <span className="category-label">{t(category.i18nLabel) ?? category.label}</span>
    </div>
  );
};

export default CategoryName;
