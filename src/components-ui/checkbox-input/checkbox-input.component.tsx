import React from 'react';

import './checkbox-input.styles.scss';

interface CheckboxInputProps {
  label: string;
  name: string;
  checked: boolean;
  // eslint-disable-next-line no-unused-vars
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

const CheckboxInput: React.FC<CheckboxInputProps> = ({
  label,
  name,
  checked,
  onChange,
  disabled = false,
}) => (
  <div className="checkbox-input">
    <input
      type="checkbox"
      id={name}
      name={name}
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className="form-checkbox"
    />
    <label htmlFor={name} className="checkbox-label">
      {label}
    </label>
  </div>
);

export default CheckboxInput;
