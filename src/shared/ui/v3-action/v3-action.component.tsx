import React, { useCallback, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { IconType } from 'react-icons';

import { LocalSpinner } from '../spinners';
import { TTIcon } from '../icon';

import './v3-action.styles.scss';

type V3ActionVariant = 'primary' | 'secondary' | 'quiet' | 'destructive';
type V3ActionSize = 'sm' | 'md' | 'lg';
type HapticType = 'light' | 'medium' | 'none';

interface V3ActionProps {
  children?: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  variant?: V3ActionVariant;
  size?: V3ActionSize;
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

const V3Action: React.FC<V3ActionProps> = ({
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
        'v3-action',
        `v3-action--${variant}`,
        `v3-action--${size}`,
        {
          'v3-action--icon-only': iconOnly,
          'v3-action--full': fullWidth,
          'v3-action--loading': loading,
          'v3-action--disabled': disabled,
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

export default V3Action;
