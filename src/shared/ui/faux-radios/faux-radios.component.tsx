import React from 'react';
import clsx from 'clsx';

import { InfoPopover } from '../info-popover';

import './faux-radios.styles.scss';

interface FauxRadiosProps {
  disabled?: boolean;
  value: boolean;
  setValue: (value: boolean) => void;
  trueLabel: string;
  falseLabel: string;
  popover?: string;
  title: string;
}

const FauxRadios: React.FC<FauxRadiosProps> = ({
  disabled = false,
  title,
  value,
  trueLabel,
  falseLabel,
  setValue,
  popover = null,
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
        <button
          type="button"
          className={clsx('option-btn', {
            selected: !value,
            disabled: disabled,
          })}
          onClick={() => setValue(false)}
        >
          {falseLabel}
        </button>
        <button
          type="button"
          className={clsx('option-btn', {
            selected: value,
            disabled: disabled,
          })}
          onClick={() => setValue(true)}
        >
          {trueLabel}
        </button>
      </div>
    </div>
  );
};

export default FauxRadios;
