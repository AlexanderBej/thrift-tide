import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { FaChevronRight } from 'react-icons/fa';

import { Accordion, ExpansionPanelItem, TTIcon } from '@shared/ui';
import { selectCards } from '@store/budget-store';
import { CategoryName } from 'components/category-name';
import { getCssVar } from '@shared/utils';
import { ProgressBar } from '@components';

import './category-cards.styles.scss';

const CategoryCards: React.FC = () => {
  const cards = useSelector(selectCards);
  const { t } = useTranslation(['common', 'budget', 'taxonomy']);

  if (!cards) return null;

  const accordionItems: ExpansionPanelItem[] = cards.map((c) => {
    return {
      id: c.key,
      title: (
        <>
          <div className="card-title-row">
            <CategoryName category={c.key} />
            <span>
              {Math.max(0, Math.min(100, Math.round((c.remaining / c.allocated) * 100)))}%{' '}
              {t('budget:left')}
            </span>
          </div>
          <ProgressBar progress={c.progress} color={getCssVar(`--${c.key}`)} />
        </>
      ),
      content: (
        <>
          <div className="details-container">
            <div className="card-details">
              <span>{t('budget:allocated') ?? 'Allocated'}</span>
              <span>
                <strong>{c.allocated}</strong>
              </span>
            </div>

            <div className="card-details">
              {c.title === 'Savings' ? (
                <span>{t('budget:contributed') ?? 'Contributed'}</span>
              ) : (
                <span>{t('budget:spent') ?? 'Spent'}</span>
              )}
              <span>
                <strong>{c.spent}</strong>
              </span>
            </div>

            <div className="card-details">
              <span>{t('budget:remaining') ?? 'Remaining'}</span>
              <span>
                <strong>{c.remaining}</strong>
              </span>
            </div>
          </div>
          <div className="category-link-container">
            <NavLink to={'/categories/' + c.key} className="category-link">
              <span>
                {t('actions.goToCategory', { catName: t(`taxonomy:categoryNames.${c.key}`) })}
              </span>
              <TTIcon icon={FaChevronRight} size={16} color={getCssVar('--color-primary')} />
            </NavLink>
          </div>
        </>
      ),
    };
  });

  return (
    <div className="dashboard-cards">
      <Accordion type="single" defaultOpenId="needs" items={accordionItems} />
    </div>
  );
};

export default CategoryCards;
