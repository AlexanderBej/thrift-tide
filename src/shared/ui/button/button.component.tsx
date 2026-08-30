// import React from 'react';
// import clsx from 'clsx';

// import { LocalSpinner } from '../spinners';

// import './button.styles.scss';

// interface ButtonProps {
//   children: React.ReactElement;
//   buttonType?: 'primary' | 'secondary' | 'neutral';
//   isLoading?: boolean;
//   isSmall?: boolean;
//   customContainerClass?: string;
//   onClick?: () => void;
//   htmlType?: 'button' | 'submit' | 'reset';
//   disabled?: boolean;
//   buttonShape?: 'square' | 'rounded';
// }

// const Button: React.FC<ButtonProps> = ({
//   children,
//   isLoading = false,
//   customContainerClass = '',
//   buttonType = 'neutral',
//   onClick,
//   htmlType = 'button',
//   disabled = false,
//   isSmall = false,
//   buttonShape = 'square',
// }) => {
//   const btnClass = clsx(
//     'thrift-tide-btn',
//     `thrift-tide-btn__${buttonType}`,
//     `thrift-tide-btn__${buttonShape}`,
//     customContainerClass,
//     {
//       'thrift-tide-btn__loading': isLoading,
//       'thrift-tide-btn__disabled': disabled,
//       'thrift-tide-btn__small': isSmall,
//     },
//   );

//   return (
//     <button className={btnClass} disabled={disabled} onClick={onClick} type={htmlType}>
//       {isLoading ? <LocalSpinner isSmall={isSmall} /> : children}
//     </button>
//   );
// };

// export default Button;

import React, { useCallback, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { IconType } from 'react-icons';

import { LocalSpinner } from '../spinners';
import { TTIcon } from '../icon';

import './button.styles.scss';

type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';
type HapticType = 'light' | 'medium' | 'none';

interface ButtonProps {
  children?: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconType;
  iconOnly?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  haptic?: HapticType;
  className?: string;
  ariaLabel?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

function runHaptic(type: HapticType) {
  if (type === 'none') return;
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    (navigator as any).vibrate(type === 'light' ? 10 : 20);
  }
}

const Button: React.FC<ButtonProps> = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  icon,
  iconOnly = false,
  fullWidth = false,
  disabled = false,
  loading = false,
  haptic = 'none',
  className,
  ariaLabel,
  onClick,
}) => {
  const [pressed, setPressed] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const inactive = disabled || loading;

  const label = useMemo(() => {
    if (!iconOnly) return ariaLabel;
    return ariaLabel ?? (typeof children === 'string' ? children : undefined);
  }, [ariaLabel, children, iconOnly]);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (inactive) return;
      setPressed(true);
      event.currentTarget.setPointerCapture?.(event.pointerId);
      runHaptic(haptic);
    },
    [haptic, inactive],
  );

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (inactive) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
    },
    [inactive, onClick],
  );

  return (
    <button
      ref={buttonRef}
      type={type}
      className={clsx(
        'tt-button',
        `tt-button--${variant}`,
        `tt-button--${size}`,
        {
          'tt-button--icon-only': iconOnly,
          'tt-button--full': fullWidth,
          'tt-button--loading': loading,
          'tt-button--disabled': disabled,
        },
        className,
      )}
      data-pressed={pressed ? 'true' : 'false'}
      disabled={inactive}
      aria-label={label}
      aria-busy={loading || undefined}
      onPointerDown={handlePointerDown}
      onPointerUp={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onClick={handleClick}
    >
      {loading ? (
        <LocalSpinner isSmall={size !== 'lg'} />
      ) : (
        <>
          {icon && <TTIcon icon={icon} size={iconOnly ? 20 : 18} color="currentColor" />}
          {!iconOnly && children}
        </>
      )}
    </button>
  );
};

export default Button;
