import React from 'react';
import clsx from 'clsx';

import { InfoPopover } from '../info-popover';

import './faux-radios.styles.scss';

export interface RadioOption {
  value: string;
  label: string;
}

interface FauxRadiosProps {
  disabled?: boolean;
  value: string;
  valueList: RadioOption[];
  setValue: (value: string) => void;
  popover?: string;
  title: string;
}

const FauxRadios: React.FC<FauxRadiosProps> = ({
  disabled = false,
  title,
  value,
  valueList,
  setValue,
  popover,
}) => {
  return (
    <div className={clsx('faux-radios', { 'row-disabled': disabled })}>
      <div className="radios-label">
        <span>{title}</span>
        {popover && (
          <InfoPopover position={'left'}>
            <span>{popover}</span>
          </InfoPopover>
        )}
      </div>

      <div className="radios-options">
        {valueList.map((val, index) => (
          <button
            key={index}
            className={clsx('option-btn', {
              selected: val.value === value,
              disabled: disabled,
            })}
            onClick={() => setValue(val.value)}
          >
            {val.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FauxRadios;
