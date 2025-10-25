import React from 'react';
import { TbHomeStar } from 'react-icons/tb';
import { GiWantedReward } from 'react-icons/gi';
import { MdDataSaverOn } from 'react-icons/md';
import { IconType } from 'react-icons';

import { SelectOption } from '../../../select/select.component';
import { TransactionType, Txn } from '../../../../utils/firebase.util';
import { getCssVar } from '../../../../utils/style-variable.util';
import TTIcon from '../../../icon/icon.component';

import './type-box-selector.styles.scss';
import { TransactionFormData } from '../add-transaction-modal.component';

interface TypeBoxSelectorProps {
  formData: TransactionFormData;
  handleTypeChange: (e: TransactionType) => void;
}

const TypeBoxSelector: React.FC<TypeBoxSelectorProps> = ({ formData, handleTypeChange }) => {
  const TYPE_OPTIONS: SelectOption[] = [
    { value: 'need', label: 'Need', icon: TbHomeStar },
    { value: 'want', label: 'Want', icon: GiWantedReward },
    { value: 'saving', label: 'Saving', icon: MdDataSaverOn },
  ];

  const getTypeColor = (value: TransactionType) => {
    if (formData.type === value) {
      const colorVarName = `--${value}s`;
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
                background: getTypeColor(opt.value as TransactionType),
                color: formData.type === opt.value ? '' : '',
              }}
              onClick={() => handleTypeChange(opt.value as TransactionType)}
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
