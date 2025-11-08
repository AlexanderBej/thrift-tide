import React from 'react';
import clsx from 'clsx';

import { LocalSpinner } from '../spinners';

import './button.styles.scss';

interface ButtonProps {
  children: React.ReactElement;
  buttonType?: 'primary' | 'secondary' | 'neutral';
  isLoading?: boolean;
  isSmall?: boolean;
  customContainerClass?: string;
  onClick?: () => void;
  htmlType?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  buttonShape?: 'square' | 'rounded';
}

const Button: React.FC<ButtonProps> = ({
  children,
  isLoading = false,
  customContainerClass = '',
  buttonType = 'neutral',
  onClick,
  htmlType = 'button',
  disabled = false,
  isSmall = false,
  buttonShape = 'square',
}) => {
  const btnClass = clsx(
    'thrift-tide-btn',
    `thrift-tide-btn__${buttonType}`,
    `thrift-tide-btn__${buttonShape}`,
    customContainerClass,
    {
      'thrift-tide-btn__loading': isLoading,
      'thrift-tide-btn__disabled': disabled,
      'thrift-tide-btn__small': isSmall,
    },
  );
  return (
    <button className={btnClass} disabled={disabled} onClick={onClick} type={htmlType}>
      {isLoading ? <LocalSpinner isSmall={isSmall} /> : children}
    </button>
  );
};

export default Button;
