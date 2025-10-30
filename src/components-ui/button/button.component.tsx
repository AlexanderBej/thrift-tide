import React from 'react';
import Spinner from '../spinner/local-spinner/local-spinner.component';

import './button.styles.scss';

interface ButtonProps {
  children: React.ReactElement;
  buttonType?: 'primary' | 'secondary' | 'neutral';
  isLoading?: boolean;
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
  buttonShape = 'square',
}) => {
  return (
    <button
      className={`thrift-tide-btn thrift-tide-btn__${buttonType} thrift-tide-btn__${buttonShape} ${customContainerClass} ${isLoading && 'thrift-tide-btn__loading'} ${disabled ? 'thrift-tide-btn__disabled' : ''}`}
      disabled={disabled}
      onClick={onClick}
      type={htmlType}
    >
      {isLoading ? <Spinner /> : children}
    </button>
  );
};

export default Button;
