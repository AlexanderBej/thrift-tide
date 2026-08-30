import React, { JSX, useCallback, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

import './pressable.styles.scss';

export type HapticType = 'light' | 'medium' | 'none';
export type RippleColor = 'auto' | 'light' | 'dark';

export type PressableProps = {
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';

  /** Tactile feedback */
  pressScale?: number;
  pressOverlay?: boolean;
  haptic?: HapticType;

  /** Ripple */
  ripple?: boolean;
  rippleColor?: RippleColor;

  /** Events */
  onClick?: React.MouseEventHandler<HTMLElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLElement>;

  children: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLElement>, 'onClick' | 'onKeyDown'>;

type RippleItem = {
  id: number;
  x: number;
  y: number;
  size: number;
};

const RIPPLE_DURATION = 520;

function runHaptic(type: HapticType) {
  if (type === 'none') return;

  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(type === 'light' ? 10 : 20);
  }
}

const Pressable: React.FC<PressableProps> = ({
  as = 'button',
  type = 'button',
  className,
  disabled = false,

  pressScale = 0.98,
  pressOverlay = true,

  ripple = false,
  rippleColor = 'auto',

  haptic = 'none',

  onClick,
  onKeyDown,
  children,
  ...rest
}) => {
  const Comp = as as React.ElementType;

  const rootRef = useRef<HTMLElement | null>(null);
  const rippleIdRef = useRef(0);
  const rippleTimersRef = useRef<number[]>([]);

  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<RippleItem[]>([]);

  useEffect(() => {
    return () => {
      rippleTimersRef.current.forEach(window.clearTimeout);
    };
  }, []);

  const addRipple = useCallback((clientX: number, clientY: number) => {
    const element = rootRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.1;

    const ripple: RippleItem = {
      id: ++rippleIdRef.current,
      x: clientX - rect.left - size / 2,
      y: clientY - rect.top - size / 2,
      size,
    };

    setRipples((current) => [...current, ripple]);

    const timer = window.setTimeout(() => {
      setRipples((current) => current.filter((item) => item.id !== ripple.id));

      rippleTimersRef.current = rippleTimersRef.current.filter((timerId) => timerId !== timer);
    }, RIPPLE_DURATION);

    rippleTimersRef.current.push(timer);
  }, []);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (disabled) return;

      setIsPressed(true);
      event.currentTarget.setPointerCapture?.(event.pointerId);

      runHaptic(haptic);

      if (ripple) {
        addRipple(event.clientX, event.clientY);
      }
    },
    [addRipple, disabled, haptic, ripple],
  );

  const releasePress = useCallback(() => {
    setIsPressed(false);
  }, []);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (disabled) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      onClick?.(event);
    },
    [disabled, onClick],
  );

  return (
    <Comp
      ref={(node: HTMLElement | null) => {
        rootRef.current = node;
      }}
      {...(as === 'button' ? { type, disabled } : {})}
      className={clsx(
        'pressable',
        `pressable--ripple-${rippleColor}`,
        {
          'pressable--overlay': pressOverlay,
          'pressable--ripple': ripple,
          'pressable--disabled': disabled,
        },
        className,
      )}
      data-pressed={isPressed ? 'true' : 'false'}
      style={
        {
          ...rest.style,
          '--press-scale': pressScale,
        } as React.CSSProperties
      }
      {...rest}
      onPointerDown={handlePointerDown}
      onPointerUp={releasePress}
      onPointerCancel={releasePress}
      onPointerLeave={releasePress}
      onClick={handleClick}
      onKeyDown={onKeyDown}
      aria-disabled={as !== 'button' && disabled ? true : undefined}
      tabIndex={as !== 'button' && disabled ? -1 : rest.tabIndex}
    >
      <span className="pressable-content">{children}</span>

      {ripple && (
        <span className="pressable-ripples" aria-hidden="true">
          {ripples.map((item) => (
            <span
              key={item.id}
              className="pressable-ripple"
              style={{
                left: item.x,
                top: item.y,
                width: item.size,
                height: item.size,
              }}
            />
          ))}
        </span>
      )}
    </Comp>
  );
};

export default Pressable;
