import React from 'react';
import clsx from 'clsx';
import { IconType } from 'react-icons';

import TTIcon from '../icon/icon.component';
import { getCssVar } from '@shared/utils';

import './form-input.styles.scss';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  value: string | number;
  required?: boolean;
  maxLength?: number;
  className?: string;
  error?: string;
  currency?: 'EUR' | 'RON';
  prefixIcon?: IconType;
  suffixIcon?: IconType;
  handleSuffixClick?: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

const Input: React.FC<InputProps> = ({
  label,
  required,
  value,
  maxLength = 999,
  type = 'text',
  className,
  error,
  readOnly,
  disabled,
  currency,
  prefixIcon,
  suffixIcon,
  handleSuffixClick,
  ...otherProps
}) => {
  const inputClass = clsx('input-field', {
    'input-error': error,
    'input-with-prefix': prefixIcon || currency === 'EUR',
    readOnly,
    disabled,
  });

  return (
    <div className={clsx('input-wrapper', className)}>
      {label && (
        <label htmlFor={otherProps.name} className="input-label">
          {label}
        </label>
      )}
      <div className="input-row">
        {prefixIcon && (
          <TTIcon
            className="input-prefix"
            icon={prefixIcon}
            color={getCssVar('--text-secondary')}
            size={19}
          />
        )}
        {currency && currency === 'EUR' && <span className="input-prefix">€</span>}
        <input
          className={inputClass}
          {...otherProps}
          required={required}
          id={otherProps.name}
          data-testid={`input-${otherProps.name}`}
          value={value}
          maxLength={maxLength}
          type={type}
        />
        {suffixIcon && (
          <button type="button" onClick={handleSuffixClick} className="input-suffix">
            <TTIcon icon={suffixIcon} color={getCssVar('--text-secondary')} size={18} />
          </button>
        )}
        {currency && currency === 'RON' && <span className="input-suffix">RON</span>}
      </div>
      {error && <span className="input-error-message">{error}</span>}
    </div>
  );
};

export default Input;
