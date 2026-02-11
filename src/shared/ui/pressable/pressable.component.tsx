import React, { JSX, useCallback, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';

import './pressable.styles.scss';

type HapticType = 'light' | 'medium' | 'none';
type RippleColor = 'auto' | 'light' | 'dark';

export type PressableProps = {
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'neutral' | 'icon';

  /** Visual feedback */
  pressScale?: number; // e.g. 0.98
  pressOverlay?: boolean;

  /** Ripple */
  ripple?: boolean;
  rippleColor?: RippleColor;

  /** Haptics (best-effort) */
  haptic?: HapticType;

  /** Events */
  onClick?: React.MouseEventHandler;
  onKeyDown?: React.KeyboardEventHandler;

  children: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLElement>, 'onClick' | 'onKeyDown'>;

type RippleItem = {
  id: number;
  x: number;
  y: number;
  size: number;
};

function runHaptic(type: HapticType) {
  if (type === 'none') return;
  // Best-effort. iOS Safari usually ignores vibration; Android supports it.
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    const pattern = type === 'light' ? 10 : 20;
    (navigator as any).vibrate(pattern);
  }
}

const Pressable: React.FC<PressableProps> = ({
  as = 'button',
  className = '',
  disabled = false,
  variant = 'icon',

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
  const Comp = as as any;
  const rootRef = useRef<HTMLElement | null>(null);

  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<RippleItem[]>([]);

  const rippleClass = useMemo(() => {
    if (rippleColor === 'light') return 'pressable__ripple--light';
    if (rippleColor === 'dark') return 'pressable__ripple--dark';
    return 'pressable__ripple--auto';
  }, [rippleColor]);

  const addRipple = useCallback((clientX: number, clientY: number) => {
    const el = rootRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.1; // slightly larger feels nicer
    const x = clientX - rect.left - size / 2;
    const y = clientY - rect.top - size / 2;

    const id = Date.now() + Math.floor(Math.random() * 1000);
    setRipples((prev) => [...prev, { id, x, y, size }]);

    // Remove after animation
    window.setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 520);
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (disabled) return;

      setIsPressed(true);

      // Capture so we reliably get pointerup even if finger moves off
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);

      if (haptic !== 'none') runHaptic(haptic);

      if (ripple) addRipple(e.clientX, e.clientY);
    },
    [disabled, haptic, ripple, addRipple],
  );

  const onPointerUp = useCallback(() => {
    setIsPressed(false);
  }, []);

  const onPointerCancel = useCallback(() => {
    setIsPressed(false);
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (disabled) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      onClick?.(e);
    },
    [disabled, onClick],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      onKeyDown?.(e);
      // Optional: haptic on Space/Enter for keyboard users
      if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
        if (haptic !== 'none') runHaptic(haptic);
      }
    },
    [disabled, haptic, onKeyDown],
  );

  return (
    <Comp
      ref={(node: HTMLElement | null) => {
        rootRef.current = node;
      }}
      className={clsx('pressable', className, `pressable__${variant}`, rippleClass, {
        pressable__overlay: pressOverlay,
        pressable__ripple: ripple,
        pressable__disabled: disabled,
      })}
      data-pressed={isPressed ? 'true' : 'false'}
      style={
        {
          ...(rest.style || {}),
          // press scale via CSS var so you can tweak per button
          ['--press-scale' as any]: String(pressScale),
        } as React.CSSProperties
      }
      // Mobile highlight removal
      // (also do globally in CSS if you prefer)
      {...rest}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onPointerLeave={onPointerUp}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : rest.tabIndex}
    >
      <span className="pressable-content">{children}</span>

      {ripple && (
        <span className="pressable-ripples" aria-hidden="true">
          {ripples.map((r) => (
            <span
              key={r.id}
              className="pressable-ripple"
              style={{
                left: r.x,
                top: r.y,
                width: r.size,
                height: r.size,
              }}
            />
          ))}
        </span>
      )}
    </Comp>
  );
};

export default Pressable;
