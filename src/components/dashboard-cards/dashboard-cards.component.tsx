import React from 'react';
import { TbHomeStar } from 'react-icons/tb';
import { GiWantedReward } from 'react-icons/gi';
import { MdDataSaverOn } from 'react-icons/md';
import { CiSquareQuestion } from 'react-icons/ci';

import { useSelector } from 'react-redux';
import { CategoryCard, selectCards } from '../../store/budget-store/budget.selectors';

import './dashboard-cards.styles.scss';
import TTIcon from '../icon/icon.component';
import { IconType } from 'react-icons';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../progress-bar/progress-bar.component';

const fmt = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const DashboardCards: React.FC = () => {
  const navigate = useNavigate();
  const cards = useSelector(selectCards);

  if (!cards) return null;

  const getCategoryIcon = (c: string): IconType => {
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

  const getCategoryColor = (c: string): string => {
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
          onClick={() => navigate(`/categories/${c.title.toLowerCase()}`)}
        >
          <div className="card-title-row">
            <div className="cart-title-icon" style={{ background: getCategoryColor(c.key) }}>
              {c.key && <TTIcon icon={getCategoryIcon(c.key)} size={22} color="white" />}
            </div>
            <span>{c.title}</span>
          </div>
          <div className="card-details">
            <span>Allocated</span>
            <span>
              <strong>€{fmt(c.allocated)}</strong>
            </span>
          </div>

          <div className="card-details">
            <span>Spent</span>
            <span>
              <strong>€{fmt(c.spent)}</strong>
            </span>
          </div>

          <div className="card-details">
            <span>Remaining</span>
            <span>
              <strong>€{fmt(c.remaining)}</strong>
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
