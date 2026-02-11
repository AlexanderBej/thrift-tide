import React from 'react';
import { GrValidate } from 'react-icons/gr';
import { IoWarningOutline } from 'react-icons/io5';
import { MdOutlineDangerous } from 'react-icons/md';
import { IoIosInformationCircleOutline } from 'react-icons/io';
import { CiSquareQuestion } from 'react-icons/ci';
import { useTranslation } from 'react-i18next';

import { Badge, BadgeKind } from '@api/models';
import { TTIcon } from '@shared/ui';

import './badge-pills.styles.scss';

const BadgePills: React.FC<{
  badges: Badge[];
  badgeType?: 'chip' | 'card';
  onClickBadge?: (b: Badge) => void;
}> = ({ badges, badgeType = 'chip', onClickBadge }) => {
  const { t } = useTranslation('budget');

  const getBadgeIcon = (kind: BadgeKind) => {
    switch (kind) {
      case 'info':
        return IoIosInformationCircleOutline;
      case 'danger':
        return MdOutlineDangerous;
      case 'success':
        return GrValidate;
      case 'warn':
        return IoWarningOutline;
      default:
        return CiSquareQuestion;
    }
  };

  return (
    <div className="badge-row">
      {badges.map((b) => (
        <button
          key={b.id}
          className={`badge-pill badge-pill__${b.kind} badge-pill__${badgeType}`}
          onClick={() => onClickBadge?.(b)}
          title={b.scope ? `Scope: ${b.scope}` : undefined}
          type="button"
        >
          <TTIcon
            icon={getBadgeIcon(b.kind)}
            className={`badge-pill-icon__${b.kind}`}
            size={badgeType === 'card' ? 24 : 14}
          />
          {t(b.i18nKey) ?? b.text}
        </button>
      ))}
    </div>
  );
};

export default BadgePills;
