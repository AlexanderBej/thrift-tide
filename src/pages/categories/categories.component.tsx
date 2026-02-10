import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { InfoBlock } from '@shared/ui';
import { CategoryInfo, CategoriesHealth } from 'features';
import { selectBudgetDoc } from '@store/budget-store';

import './categories.styles.scss';

const CategoriesPage: React.FC = () => {
  const { t } = useTranslation('common');
  const doc = useSelector(selectBudgetDoc);

  return (
    <div className="categories-page">
      <InfoBlock>
        <span>{t('pageContent.categories.info')}</span>
      </InfoBlock>

      {doc !== null && doc.income > 0 && (
        <section className="tt-section">
          <CategoriesHealth />
        </section>
      )}
      <section className="tt-section">
        <CategoryInfo />
      </section>
    </div>
  );
};

export default CategoriesPage;
