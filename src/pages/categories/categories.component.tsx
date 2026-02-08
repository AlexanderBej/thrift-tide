import React from 'react';

import { InfoBlock } from '@shared/ui';
import { CategoryInfo, CategoriesHealth } from 'features';

import './categories.styles.scss';

const CategoriesPage: React.FC = () => {
  return (
    <div className="categories-page">
      <InfoBlock>
        <span>Track the health of your categories and adjust your allocations as needed.</span>
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
