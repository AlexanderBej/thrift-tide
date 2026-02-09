import React from 'react';

import { InfoBlock } from '@shared/ui';
import { CategoryInfo, CategoriesHealth } from 'features';

import './categories.styles.scss';
import { useTranslation } from 'react-i18next';

const CategoriesPage: React.FC = () => {
  const { t } = useTranslation('common');
  return (
    <div className="categories-page">
      <InfoBlock>
        <span>{t('pageContent.categories.info')}</span>
      </InfoBlock>

      <section className="tt-section">
        <CategoriesHealth />
      </section>
      <section className="tt-section">
        <CategoryInfo />
      </section>
    </div>
  );
};

export default CategoriesPage;
