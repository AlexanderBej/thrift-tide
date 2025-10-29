import React, { useEffect, useState } from 'react';
import { MdEuro } from 'react-icons/md';
import { Eye, EyeOff } from 'lucide-react';
import { CiSearch } from 'react-icons/ci';

import AutoResizeTextarea from './auto-resize-textarea/auto-resize-textarea.component';
import TTIcon from '../icon/icon.component';
import { getCssVar } from '../../utils/style-variable.util';

import './form-input.styles.scss';

interface PasswordFieldVisibility {
  isFieldPassword?: boolean;
  isMainField?: boolean;
}

interface FormInputProps {
  label?: string;
  value: string | number;
  required?: boolean;
  inputType?: 'text' | 'textarea' | 'number' | 'search' | 'range';
  prefix?: 'euro' | 'search' | 'other' | 'none';
  isMaxLengthShown?: boolean;
  passwordField?: PasswordFieldVisibility;
  maxLength?: number;
  numberMaxDecimals?: 0 | 1 | 2 | 3 | 4;
  errors?: string;
  customClassName?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  required,
  value,
  inputType = 'text',
  prefix = 'none',
  isMaxLengthShown = false,
  passwordField = { isFieldPassword: false, isMainField: false },
  maxLength = 999,
  numberMaxDecimals = 2,
  customClassName,
  errors,
  ...otherProps
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const passwordValidationRules = [
    {
      id: 'length',
      label: 'At least 8 characters',
      test: (pw: string) => pw.length >= 8,
    },
    {
      id: 'lowercase',
      label: 'At least one lowercase letter',
      test: (pw: string) => /[a-z]/.test(pw),
    },
    {
      id: 'uppercase',
      label: 'At least one uppercase letter',
      test: (pw: string) => /[A-Z]/.test(pw),
    },
    {
      id: 'number',
      label: 'At least one number',
      test: (pw: string) => /\d/.test(pw),
    },
    {
      id: 'special',
      label: 'At least one special character (!@#$%^&*)',
      test: (pw: string) => /[!@#$%^&*]/.test(pw),
    },
  ];

  useEffect(() => {
    if (isNumber && typeof value === 'number') {
      const formatted = value.toFixed(2);
      if (String(value) !== formatted) {
        const synthetic = {
          target: { name: otherProps.name, value: formatted },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        otherProps.onChange?.(synthetic);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Utility to normalize commas and ensure two decimals
  const formatToTwoDecimals = (val: string | number): string => {
    const n = Number(String(val).replace(',', '.'));
    if (isNaN(n)) return '';
    return n.toFixed(2);
  };

  // Allow typing digits and up to 2 decimals
  const allowPattern = new RegExp(`^\\d*(?:[\\.,]\\d{0,${numberMaxDecimals}})?$`);

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '' || allowPattern.test(raw)) {
      otherProps.onChange?.(e);
    }
  };

  const handleNumberBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (!raw) {
      otherProps.onBlur?.(e);
      return;
    }

    const formatted = formatToTwoDecimals(raw);

    // Synthesize a formatted change event for parent
    const synthetic = {
      ...e,
      target: { ...e.target, value: formatted },
      currentTarget: { ...e.currentTarget, value: formatted },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    otherProps.onChange?.(synthetic);
    otherProps.onBlur?.(e);
  };

  const isNumber = inputType === 'number';

  return (
    <>
      <div className={`group ${customClassName}`}>
        {label && (
          <label className={`${value ? 'shrink' : ''} form-input-label`} htmlFor={otherProps.name}>
            {label} {required && <span className="text-red">*</span>}
          </label>
        )}
        <div className="form-input-row">
          {inputType === 'textarea' ? (
            <AutoResizeTextarea
              id={otherProps.name}
              value={value as string}
              className="form-input"
              data-testid={`textarea-${otherProps.name}`}
              maxLength={maxLength}
              {...otherProps}
              required={required}
            />
          ) : (
            <input
              className="form-input"
              {...otherProps}
              type={isNumber ? 'text' : inputType}
              inputMode={isNumber ? 'decimal' : undefined}
              pattern={isNumber ? `[0-9]*[\\.,]?[0-9]{0,${numberMaxDecimals}}` : undefined}
              required={required}
              id={otherProps.name}
              data-testid={`input-${otherProps.name}`}
              value={value}
              maxLength={maxLength}
              style={{
                paddingLeft: prefix !== 'none' ? '35px' : '15px',
                borderColor: errors ? getCssVar('--error') : '',
              }}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={isNumber ? handleNumberBlur : () => setIsPasswordFocused(false)}
              onChange={isNumber ? handleNumberChange : otherProps.onChange}
            />
          )}

          {prefix !== 'none' ? (
            <div className="form-input-prefix">
              <TTIcon icon={prefix === 'euro' ? MdEuro : CiSearch} size={18} />
            </div>
          ) : (
            <span></span>
          )}

          {isMaxLengthShown && (
            <span className="input-max-value">
              {String(value ?? '').length} / {maxLength}
            </span>
          )}

          {passwordField.isFieldPassword && (
            <button
              type="button"
              className="toggle-password-btn"
              onClick={() => setShowPassword((prev) => !prev)}
              data-testid="toggle-password-password"
            >
              {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          )}
        </div>

        {errors && (
          <p className="field-error" id={`err-${otherProps.name}`}>
            {errors}
          </p>
        )}
      </div>
      {passwordField.isMainField && isPasswordFocused && (
        <ul className="password-rules">
          {passwordValidationRules.map((rule) => (
            <li
              key={rule.id}
              className={`password-rule ${isPasswordFocused ? 'red' : 'grey'} ${
                rule.test(String(value)) ? 'green' : ''
              }`}
            >
              {rule.label}
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default FormInput;
