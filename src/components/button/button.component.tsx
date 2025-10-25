import React from 'react';
import Spinner from '../spinner/spinner.component';

import './button.styles.scss';

interface ButtonProps {
  children: React.ReactElement;
  buttonType?: 'primary' | 'secondary' | 'neutral';
  isLoading?: boolean;
  customContainerClass?: string;
  onClick?: () => void;
  htmlType?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  isLoading = false,
  customContainerClass = '',
  buttonType = 'neutral',
  onClick,
  htmlType = 'button',
  disabled = false,
}) => {
  return (
    // <div className={`${customContainerClass} btn-container`}>
    <button
      className={`thrift-tide-btn thrift-tide-btn__${buttonType} ${customContainerClass} ${disabled ? 'thrift-tide-btn__disabled' : ''}`}
      disabled={disabled}
      onClick={onClick}
      type={htmlType}
    >
      {isLoading ? <Spinner /> : children}
    </button>
    // </div>
  );
};

export default Button;
