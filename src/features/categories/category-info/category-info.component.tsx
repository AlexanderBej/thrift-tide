import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { FaChevronRight } from 'react-icons/fa';

import { TTIcon } from '@shared/ui';
import { selectCategoriesTopInsights, selectCards } from '@store/budget-store';
import { CategoryName } from 'components/category-name';
import { getCssVar } from '@shared/utils';
import { ProgressBar } from '@components';
import { SmartInsightChip } from 'features/insights';
import { Category, CategoryInsightCandidate } from '@api/types';
import { useFormatMoney } from '@shared/hooks';

import './category-info.styles.scss';

const CategoryInfo: React.FC = () => {
  const cards = useSelector(selectCards);
  const { needs, wants, savings } = useSelector(selectCategoriesTopInsights);

  const { t } = useTranslation('budget');
  const fmtCurrency = useFormatMoney(true);

  if (!cards) return null;

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

  const getInsight = (key: Category) => {
    return (key === 'needs' ? needs : key === 'wants' ? wants : savings)[0];
  };

  const getRestOfInsights = (key: Category): CategoryInsightCandidate[] => {
    const categories = key === 'needs' ? needs : key === 'wants' ? wants : savings;
    return categories.slice(1);
  };

  return (
    <div className="category-info">
      {cards.map((c, index) => (
        <div key={index} className="category-info-block">
          <div className="category-title-row">
            <CategoryName category={c.key} />
            <div className="title-row-end">
              <span>
                {Math.max(0, Math.min(100, Math.round((c.remaining / c.allocated) * 100)))}% left
              </span>
              <NavLink to={'/categories/' + c.key} className="category-link">
                <TTIcon icon={FaChevronRight} size={16} color={getCssVar('--color-primary')} />
              </NavLink>
            </div>
          </div>

          <h3 className="spent-header">
            {c.title === 'Savings' ? 'You contributed' : 'You spent'}{' '}
            <span className="spent-value">{fmtCurrency(c.spent)}</span>
          </h3>

          <div className="smart-chip-wrapper">
            <SmartInsightChip insight={getInsight(c.key)} showCta={false} />
          </div>

          <ProgressBar progress={c.progress} color={getCatColor(c.key)} />

          <div className="category-details-container">
            <div className="category-details">
              <span className="detail-name">{t('allocated') ?? 'Allocated'}:</span>
              <span>{fmtCurrency(c.allocated)}</span>
            </div>

            <div className="category-details">
              <span className="detail-name">{t('remaining') ?? 'Remaining'}:</span>
              <span>{fmtCurrency(c.remaining)}</span>
            </div>
          </div>

          <div className="insight-chip-list">
            {getRestOfInsights(c.key).map((ins) => (
              <SmartInsightChip key={ins.id} insight={ins} small />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategoryInfo;
