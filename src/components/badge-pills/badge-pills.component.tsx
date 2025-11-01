import React, { useEffect, useState } from 'react';
import { GrValidate } from 'react-icons/gr';
import { IoWarningOutline } from 'react-icons/io5';
import { MdOutlineDangerous } from 'react-icons/md';
import { IoIosInformationCircleOutline } from 'react-icons/io';
import { CiSquareQuestion } from 'react-icons/ci';
import { useTranslation } from 'react-i18next';

import { Badge, BadgeKind } from '../../api/models/badges';
import TTIcon from '../../components-ui/icon/icon.component';
import { useWindowWidth } from '../../utils/window-width.hook';

import './badge-pills.styles.scss';

interface TranslatedBadge extends Badge {
  i18nText: string;
}

export const BadgePills: React.FC<{
  badges: Badge[];
  badgeType?: 'chip' | 'card';
  onClickBadge?: (b: Badge) => void;
}> = ({ badges, badgeType = 'chip', onClickBadge }) => {
  const { t } = useTranslation('budget');
  const [translatedBadges, setTranslatedBadges] = useState<TranslatedBadge[]>([]);
  const width = useWindowWidth();
  const isMobile = width < 480;

  useEffect(() => {
    const loc = badges.map((l) => {
      switch (l.id) {
        case 'wants-over':
          return {
            ...l,
            i18nText: `${t('budget:bucketNames.wants')} ${t('budget:badges.overBudget')}`,
          } as TranslatedBadge;
        case 'needs-near':
          return {
            ...l,
            i18nText: `${t('budget:bucketNames.needs')} ${t('budget:badges.nearBudget')}`,
          } as TranslatedBadge;
        case 'high-burn':
          return {
            ...l,
            i18nText: `${t('budget:badges.highBurn')}`,
          } as TranslatedBadge;

        case 'save-behind':
          return {
            ...l,
            i18nText: `${t('budget:bucketNames.savings')} ${t('budget:badges.behindPlan')}`,
          } as TranslatedBadge;

        case 'under-pace':
          return {
            ...l,
            i18nText: `${t('budget:badges.underPace')} (${t('budget:badges.good')})`,
          } as TranslatedBadge;

        default:
          return l as TranslatedBadge;
      }
    });

    setTranslatedBadges(loc);
  }, [badges, t]);

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
      {translatedBadges.map((b) => (
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
            size={badgeType === 'card' && !isMobile ? 24 : 14}
          />
          {b.i18nText ?? b.text}
        </button>
      ))}
    </div>
  );
};
