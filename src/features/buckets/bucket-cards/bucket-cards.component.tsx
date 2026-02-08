import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { FaChevronRight } from 'react-icons/fa';

import { Accordion, ExpansionPanelItem, TTIcon } from '@shared/ui';
import { selectCards } from '@store/budget-store';
import { BucketName } from 'components/bucket-name';
import { getCssVar } from '@shared/utils';
import { ProgressBar } from '@components';

import './bucket-cards.styles.scss';

const BucketCards: React.FC = () => {
  const cards = useSelector(selectCards);
  const { t } = useTranslation('budget');

  if (!cards) return null;

  const getBucketColor = (c: string): string => {
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

  const accordionItems: ExpansionPanelItem[] = cards.map((c) => {
    return {
      id: c.key,
      title: (
        <>
          <div className="card-title-row">
            <BucketName bucket={c.key} />
            <span>
              {Math.max(0, Math.min(100, Math.round((c.remaining / c.allocated) * 100)))}% left
            </span>
          </div>
          <ProgressBar progress={c.progress} color={getBucketColor(c.key)} />
        </>
      ),
      content: (
        <>
          <div className="details-container">
            <div className="card-details">
              <span>{t('allocated') ?? 'Allocated'}</span>
              <span>
                <strong>{c.allocated}</strong>
              </span>
            </div>

            <div className="card-details">
              {c.title === 'Savings' ? (
                <span>{t('contributed') ?? 'Contributed'}</span>
              ) : (
                <span>{t('spent') ?? 'Spent'}</span>
              )}
              <span>
                <strong>{c.spent}</strong>
              </span>
            </div>

            <div className="card-details">
              <span>{t('remaining') ?? 'Remaining'}</span>
              <span>
                <strong>{c.remaining}</strong>
              </span>
            </div>
          </div>
          <div className="bucket-link-container">
            <NavLink to={'/buckets/' + c.key} className="bucket-link">
              <span>Go to {c.key} bucket</span>
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

export default BucketCards;
