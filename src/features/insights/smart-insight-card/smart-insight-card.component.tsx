import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa';

import { useResolvedInsight } from '@shared/hooks';
import { Insight } from '@api/models';
import { getCssVar, toPathFromInsightTarget } from '@shared/utils';
import { InsightTone } from '@api/types';
import { AddActionSheet } from '@widgets';
import { TTIcon } from '@shared/ui';

import dangerPng from '../../../assets/illustrations/tone-danger.png';
import warnPng from '../../../assets/illustrations/tone-warn.png';
import infoPng from '../../../assets/illustrations/tone-info.png';
import successPng from '../../../assets/illustrations/tone-success.png';
import mutedPng from '../../../assets/illustrations/tone-muted.png';
import startDayPng from '../../../assets/illustrations/tone-start-day.png';

import './smart-insight-card.styles.scss';

interface SmartInsightCardProps {
  insight: Insight;
  showCta?: boolean;
}

const SmartInsightCard: React.FC<SmartInsightCardProps> = ({ insight, showCta = false }) => {
  const { resolve } = useResolvedInsight();
  const navigate = useNavigate();

  const [open, setOpen] = useState<boolean>(false);

  const text = resolve(insight);

  const handleInsightClick = () => {
    if (insight.id === 'no_budget') {
      setOpen(true);
    }
    if (!insight.ctaTarget) return;
    navigate(toPathFromInsightTarget(insight.ctaTarget));
  };

  const getCardImage = (tone: InsightTone) => {
    switch (tone) {
      case 'warn':
        return warnPng;
      case 'danger':
        return dangerPng;
      case 'success':
        return successPng;
      case 'info':
        return infoPng;

      default:
        if (insight.id === 'no_budget') return startDayPng;
        return mutedPng;
    }
  };

  return (
    <>
      <div className={`smart-insight-card smart-insight-card__${insight.tone}`}>
        <img src={getCardImage(insight.tone)} height={70} alt="Insight" />

        <div>
          <h3>{text.title}</h3>
          <div className="insight-message">{text.message}</div>
          {text.subtext && <span className="insight-subtext">{text.subtext}</span>}

          {showCta && text.ctaLabel && (
            <button
              className="insight-cta"
              onClick={(e) => {
                e.stopPropagation();
                handleInsightClick();
              }}
              type="button"
            >
              <span>{text.ctaLabel}</span>
              <TTIcon icon={FaChevronRight} size={12} color={getCssVar('--color-text-secondary')} />
            </button>
          )}
        </div>
      </div>

      <AddActionSheet open={open} onOpenChange={setOpen} defaultStep="income" />
    </>
  );
};

export default SmartInsightCard;
