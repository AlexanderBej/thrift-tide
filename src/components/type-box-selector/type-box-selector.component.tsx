import React from 'react';
import { TbHomeStar } from 'react-icons/tb';
import { GiWantedReward } from 'react-icons/gi';
import { MdDataSaverOn } from 'react-icons/md';
import { IconType } from 'react-icons';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

import { Bucket } from '@api/types';
import { getCssVar } from '@shared/utils';
import { SelectOption, TTIcon } from '@shared/ui';

import './type-box-selector.styles.scss';

interface TypeBoxSelectorProps {
  bucket: Bucket;
  handleTypeChange: (e: Bucket) => void;
}

const TypeBoxSelector: React.FC<TypeBoxSelectorProps> = ({ bucket, handleTypeChange }) => {
  const { t } = useTranslation('budget');

  const TYPE_OPTIONS: SelectOption[] = [
    { value: 'needs', label: t('bucketNames.needs') ?? 'Needs', icon: TbHomeStar },
    { value: 'wants', label: t('bucketNames.wants') ?? 'Wants', icon: GiWantedReward },
    { value: 'savings', label: t('bucketNames.savings') ?? 'Savings', icon: MdDataSaverOn },
  ];

  return (
    <div className="type-box-selector">
      {TYPE_OPTIONS.map((opt, index) => {
        return (
          <button
            type="button"
            key={index}
            className={clsx('type-box', opt.value, {
              selected: opt.value === bucket,
            })}
            onClick={() => handleTypeChange(opt.value as Bucket)}
          >
            <TTIcon
              icon={opt.icon as IconType}
              size={24}
              color={
                bucket === opt.value
                  ? getCssVar('--color-text-inverse')
                  : getCssVar(`--${opt.value}`)
              }
            />
            <span
              className={clsx('bucket-value', `bucket-value__${opt.value}`, {
                selected: bucket === opt.value,
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
