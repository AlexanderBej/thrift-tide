import React from 'react';
import { TbHomeStar } from 'react-icons/tb';
import { GiWantedReward } from 'react-icons/gi';
import { MdDataSaverOn } from 'react-icons/md';
import { IconType } from 'react-icons';

import { SelectOption } from '../../../select/select.component';
import { getCssVar } from '../../../../utils/style-variable.util';
import TTIcon from '../../../icon/icon.component';

import './type-box-selector.styles.scss';
import { TransactionFormData } from '../add-transaction-modal.component';
import { Bucket } from '../../../../api/types/bucket.types';

interface TypeBoxSelectorProps {
  formData: TransactionFormData;
  handleTypeChange: (e: Bucket) => void;
}

const TypeBoxSelector: React.FC<TypeBoxSelectorProps> = ({ formData, handleTypeChange }) => {
  const TYPE_OPTIONS: SelectOption[] = [
    { value: 'needs', label: 'Needs', icon: TbHomeStar },
    { value: 'wants', label: 'Wants', icon: GiWantedReward },
    { value: 'savings', label: 'Savings', icon: MdDataSaverOn },
  ];

  const getTypeColor = (value: Bucket) => {
    if (formData.type === value) {
      const colorVarName = `--${value}`;
      return getCssVar(colorVarName);
    } else return 'transparent';
  };

  return (
    <>
      <span className="type-selector-label">Type</span>
      <div className="type-box-selector">
        {TYPE_OPTIONS.map((opt, index) => {
          return (
            <div
              key={index}
              className="type-box"
              style={{
                background: getTypeColor(opt.value as Bucket),
                color: formData.type === opt.value ? '' : '',
              }}
              onClick={() => handleTypeChange(opt.value as Bucket)}
            >
              <TTIcon
                icon={opt.icon as IconType}
                size={18}
                color={
                  formData.type === opt.value ? getCssVar('--card-bg') : getCssVar('--text-primary')
                }
              />
              <span
                style={{
                  color:
                    formData.type === opt.value
                      ? getCssVar('--card-bg')
                      : getCssVar('--text-primary'),
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
