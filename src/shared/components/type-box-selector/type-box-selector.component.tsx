import React from 'react';
import { TbHomeStar } from 'react-icons/tb';
import { GiWantedReward } from 'react-icons/gi';
import { MdDataSaverOn } from 'react-icons/md';
import { IconType } from 'react-icons';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

import { Category } from '@api/types';
import { getCssVar } from '@shared/utils';
import { TTIcon } from '@shared/ui';

import './type-box-selector.styles.scss';

interface TypeBoxSelectorProps {
  category: Category;
  handleTypeChange: (e: Category) => void;
}

const TypeBoxSelector: React.FC<TypeBoxSelectorProps> = ({ category, handleTypeChange }) => {
  const { t } = useTranslation('budget');

  const TYPE_OPTIONS: { value: Category; label: string; icon: IconType }[] = [
    { value: 'needs', label: t('taxonomy:categoryNames.needs') ?? 'Needs', icon: TbHomeStar },
    { value: 'wants', label: t('taxonomy:categoryNames.wants') ?? 'Wants', icon: GiWantedReward },
    {
      value: 'savings',
      label: t('taxonomy:categoryNames.savings') ?? 'Savings',
      icon: MdDataSaverOn,
    },
  ];

  return (
    <div className="type-box-selector">
      {TYPE_OPTIONS.map((opt, index) => {
        return (
          <button
            type="button"
            key={index}
            className={clsx('type-box', opt.value, {
              selected: opt.value === category,
            })}
            onClick={() => handleTypeChange(opt.value as Category)}
          >
            <TTIcon
              icon={opt.icon as IconType}
              size={24}
              color={
                category === opt.value ? getCssVar('--anti-flash-300') : getCssVar(`--${opt.value}`)
              }
            />
            <span
              className={clsx('category-value', `category-value__${opt.value}`, {
                selected: category === opt.value,
              })}
            >
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default TypeBoxSelector;
