import React from 'react';
import { IconType } from 'react-icons';

import './select.styles.scss';
import TTIcon from '../icon/icon.component';
import { getCssVar } from '../../utils/style-variable.util';

export interface SelectOption {
  value: string | number;
  label: string | React.ReactElement;
  icon?: IconType;
}

interface SelectProps {
  label?: string;
  name: string;
  value: string | number;
  options: SelectOption[];
  required?: boolean;
  errors?: string;
  // eslint-disable-next-line , no-unused-vars
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  // Allow additional props (e.g., className, id)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

const Select: React.FC<SelectProps> = ({
  label,
  name,
  value,
  options,
  errors,
  required = false,
  onChange,
  ...otherProps
}) => (
  <div className="group">
    {label && (
      <label
        className={`${value !== undefined && value !== '' ? 'shrink' : ''} form-input-label`}
        htmlFor={name}
      >
        {label} {required && <span className="text-red">*</span>}
      </label>
    )}
    <select
      className="form-input"
      name={name}
      id={name}
      value={value}
      required={required}
      style={{ borderColor: errors ? getCssVar('--error') : '' }}
      onChange={onChange}
      {...otherProps}
    >
      <option value="" disabled hidden>
        {label ? `Select ${label}` : 'Select...'}
      </option>
      {options.map((opt, index) => (
        <option key={index} value={opt.value}>
          {/* {opt.icon && <TTIcon icon={opt.icon} size={16} />} */}
          {opt.label}
        </option>
      ))}
    </select>

    {errors && (
      <p className="field-error" id={`err-${name}`}>
        {errors}
      </p>
    )}
  </div>
);

export default Select;
