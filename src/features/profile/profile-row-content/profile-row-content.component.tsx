import React from 'react';
import { IconType } from 'react-icons';
import { FaChevronRight } from 'react-icons/fa';

import { Donut, DonutItem, TTIcon } from '@shared/ui';
import { Category, getCategoryColorVar, PercentTriple } from '@api/types';

import actionCategory from '../../../assets/illustrations/action-bucket.png';
import actionHistory from '../../../assets/illustrations/action-history.png';
import calendaryIcon from '../../../assets/illustrations/calendar-ill.png';

import './profile-row-content.styles.scss';
import clsx from 'clsx';

type ProfileRowTone = 'default' | 'danger';
type ProfileImg = 'calendar' | 'history' | 'category' | 'donut';

const ORDER: Category[] = ['needs', 'wants', 'savings'];

export interface ProfileRowContentProps {
  icon: IconType | ProfileImg;
  title: string;
  subtitle?: string;
  value?: string;
  tone?: ProfileRowTone;
  percents?: PercentTriple;
}

const profileImages: Record<ProfileImg, string> = {
  category: actionCategory,
  history: actionHistory,
  calendar: calendaryIcon,
  donut: '',
};

const ProfileRowContent: React.FC<ProfileRowContentProps> = ({
  icon,
  title,
  subtitle,
  value,
  tone = 'default',
  percents,
}) => {
  const iconClassName = clsx('profile-row__icon', {
    'profile-row__icon--image': typeof icon === 'string',
  });

  const donutItems: DonutItem[] = percents
    ? ORDER.map((key) => ({
        id: key,
        label: key,
        color: `var(--color-category-${key})`,
        value: percents[key] * 100,
      }))
    : [];

  return (
    <>
      <span className={iconClassName} aria-hidden="true">
        {typeof icon === 'string' ? (
          icon === 'donut' ? (
            <Donut height={40} showTooltip={false} data={donutItems} />
          ) : (
            <img src={profileImages[icon]} width={35} alt="Logo" />
          )
        ) : (
          <TTIcon
            icon={icon}
            size={18}
            color={tone === 'danger' ? 'var(--color-error)' : 'currentColor'}
          />
        )}
      </span>
      <span className="profile-row__copy">
        <span className="profile-row__title">{title}</span>
        {subtitle && <span className="profile-row__subtitle">{subtitle}</span>}
      </span>
      <span className="profile-row__end">
        {value && <span className="profile-row__value">{value}</span>}
        {percents &&
          ORDER.map((key, index) => (
            <React.Fragment key={key}>
              <span style={{ color: getCategoryColorVar(key) }}>
                {Math.round(percents[key] * 100)}%
              </span>

              {index < ORDER.length - 1 && <span> / </span>}
            </React.Fragment>
          ))}
        <TTIcon icon={FaChevronRight} size={13} color="var(--color-secondary)" />
      </span>
    </>
  );
};

export default ProfileRowContent;
