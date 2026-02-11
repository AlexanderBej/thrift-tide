import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa';
import { MdOutlineTipsAndUpdates } from 'react-icons/md';
import { IoWarning } from 'react-icons/io5';
import { LuPartyPopper } from 'react-icons/lu';
import { PiShootingStarThin } from 'react-icons/pi';
import { SiNeutralinojs } from 'react-icons/si';

import { useResolvedInsight } from '@shared/hooks';
import { Insight } from '@api/models';
import { getCssVar, toPathFromInsightTarget } from '@shared/utils';
import { TTIcon } from '@shared/ui';

import './smart-insight-chip.styles.scss';
import { InsightTone } from '@api/types';

interface SmartInsightCardProps {
  insight: Insight;
  showCta?: boolean;
  small?: boolean;
}

const SmartInsightChip: React.FC<SmartInsightCardProps> = ({
  insight,
  showCta = false,
  small = false,
}) => {
  const { resolve } = useResolvedInsight();
  const navigate = useNavigate();
  const text = resolve(insight);

  const titleToIcon = () => {
    switch (insight.title) {
      case 'smart.title.tip':
        return MdOutlineTipsAndUpdates;

      case 'smart.title.headsUp':
        return IoWarning;

      case 'smart.title.nice':
        return LuPartyPopper;

      case 'smart.title.freshStart':
        return PiShootingStarThin;

      default:
        return SiNeutralinojs;
    }
  };

  const toneToColor = (tone: InsightTone) => {
    switch (tone) {
      case 'danger':
        return getCssVar('--error');
      case 'info':
        return getCssVar('--color-secondary-dark');
      case 'success':
        return getCssVar('--success');
      case 'warn':
        return getCssVar('--warning');
      default:
        return getCssVar('--color-primary-dark');
    }
  };

  const go = () => {
    if (!insight.ctaTarget) return;
    navigate(toPathFromInsightTarget(insight.ctaTarget));
  };

  return (
    <div className={`smart-insight smart-insight__${insight.tone}`}>
      <TTIcon icon={titleToIcon()} size={14} color={toneToColor(insight.tone)} />

      <div className="insight-message">{small ? text.chip : text.message}</div>

      {showCta && !small && (
        <button
          className="insight-cta"
          onClick={(e) => {
            e.stopPropagation();
            go();
          }}
          type="button"
        >
          <TTIcon icon={FaChevronRight} size={14} />
        </button>
      )}
    </div>
  );
};

export default SmartInsightChip;
