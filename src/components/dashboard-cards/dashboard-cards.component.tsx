import React from 'react';
import { useTranslation } from 'react-i18next';
import { TbHomeStar } from 'react-icons/tb';
import { GiWantedReward } from 'react-icons/gi';
import { MdDataSaverOn } from 'react-icons/md';
import { CiSquareQuestion } from 'react-icons/ci';
import { useSelector } from 'react-redux';
import { IconType } from 'react-icons';
import { useNavigate } from 'react-router-dom';

import ProgressBar from '../progress-bar/progress-bar.component';
import { useFormatMoney } from '@shared/hooks';
import { TTIcon } from '@shared/ui';
import { selectCards } from '@store/budget-store';

import './dashboard-cards.styles.scss';

const DashboardCards: React.FC = () => {
  const navigate = useNavigate();
  const cards = useSelector(selectCards);
  const { t } = useTranslation('budget');
  const fmt = useFormatMoney();

  if (!cards) return null;

  const getBucketIcon = (c: string): IconType => {
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

  return (
    <div className="dashboard-cards">
      {cards.map((c) => (
        <div
          key={c.key}
          className="dashboard-card"
          onClick={() => navigate(`/buckets/${c.title.toLowerCase()}`)}
        >
          <div className="card-title-row">
            <div className="cart-title-icon" style={{ background: getBucketColor(c.key) }}>
              {c.key && <TTIcon icon={getBucketIcon(c.key)} size={22} color="white" />}
            </div>
            <span className="card-title-value">{t(`bucketNames.${c.title.toLowerCase()}`)}</span>
          </div>
          <div className="card-details">
            <span>{t('allocated') ?? 'Allocated'}</span>
            <span>
              <strong>{fmt(c.allocated)}</strong>
            </span>
          </div>

          <div className="card-details">
            <span>{t('spent') ?? 'Spent'}</span>
            <span>
              <strong>{fmt(c.spent)}</strong>
            </span>
          </div>

          <div className="card-details">
            <span>{t('remaining') ?? 'Remaining'}</span>
            <span>
              <strong>{fmt(c.remaining)}</strong>
            </span>
          </div>

          {/* progress bar */}
          <ProgressBar progress={c.progress} />
        </div>
      ))}
    </div>
  );
};

export default DashboardCards;
