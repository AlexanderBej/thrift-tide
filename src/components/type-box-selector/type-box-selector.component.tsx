import React from 'react';
import { TbHomeStar } from 'react-icons/tb';
import { GiWantedReward } from 'react-icons/gi';
import { MdDataSaverOn } from 'react-icons/md';
import { IconType } from 'react-icons';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

import { TransactionFormData } from '../add-transaction-modal/add-transaction-modal.component';
import { Bucket } from '../../api/types/bucket.types';
import { SelectOption } from '../../components-ui/select/select.component';
import { getCssVar } from '../../utils/style-variable.util';
import TTIcon from '../../components-ui/icon/icon.component';

import './type-box-selector.styles.scss';

interface TypeBoxSelectorProps {
  formData: TransactionFormData;
  handleTypeChange: (e: Bucket) => void;
}

const TypeBoxSelector: React.FC<TypeBoxSelectorProps> = ({ formData, handleTypeChange }) => {
  const { t } = useTranslation('budget');

  const TYPE_OPTIONS: SelectOption[] = [
    { value: 'needs', label: t('bucketNames.needs') ?? 'Needs', icon: TbHomeStar },
    { value: 'wants', label: t('bucketNames.wants') ?? 'Wants', icon: GiWantedReward },
    { value: 'savings', label: t('bucketNames.savings') ?? 'Savings', icon: MdDataSaverOn },
  ];

  const getTypeBoxClass = (value: Bucket) => {
    return clsx('type-box', {
      'type-box__needs': value === 'needs' && value === formData.type,
      'type-box__wants': value === 'wants' && value === formData.type,
      'type-box__savings': value === 'savings' && value === formData.type,
    });
  };

  return (
    <>
      <span className="type-selector-label">{t('modals.type') ?? 'Type'}</span>
      <div className="type-box-selector">
        {TYPE_OPTIONS.map((opt, index) => {
          return (
            <div
              key={index}
              className={getTypeBoxClass(opt.value as Bucket)}
              onClick={() => handleTypeChange(opt.value as Bucket)}
            >
              <TTIcon
                icon={opt.icon as IconType}
                size={18}
                color={
                  formData.type === opt.value
                    ? getCssVar('--color-text-inverse')
                    : getCssVar('--color-text-primary')
                }
              />
              <span
                style={{
                  color:
                    formData.type === opt.value
                      ? getCssVar('--color-text-inverse')
                      : getCssVar('--color-text-primary'),
                }}
              >
                {opt.label}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default TypeBoxSelector;
