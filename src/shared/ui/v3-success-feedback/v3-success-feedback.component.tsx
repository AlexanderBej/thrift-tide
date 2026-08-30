import React, { useEffect, useState } from 'react';
import clsx from 'clsx';

import { Button } from '../button';

import './v3-success-feedback.styles.scss';

interface V3SuccessFeedbackProps {
  message: string;
  actionLabel?: string;
  className?: string;
  compact?: boolean;
  onAction?: () => void;
}

function runSuccessHaptic() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    (navigator as any).vibrate(18);
  }
}

const V3SuccessFeedback: React.FC<V3SuccessFeedbackProps> = ({
  message,
  actionLabel,
  className,
  compact = false,
  onAction,
}) => {
  useEffect(() => {
    runSuccessHaptic();
  }, []);

  return (
    <div
      className={clsx('v3-success-feedback', compact && 'v3-success-feedback--compact', className)}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="v3-success-feedback__mark" aria-hidden="true">
        <svg viewBox="0 0 48 48" focusable="false">
          <circle cx="24" cy="24" r="19" />
          <path d="M15 24.5l6.2 6.2L34 18" />
        </svg>
      </span>
      <span className="v3-success-feedback__message">{message}</span>
      {actionLabel && onAction && (
        <Button
          variant="quiet"
          size="sm"
          className="v3-success-feedback__action"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export function useCompactSuccessFeedback(delay = 900, resetKey?: React.Key) {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    setCompact(false);
    if (resetKey == null) return undefined;

    const timer = window.setTimeout(() => setCompact(true), delay);
    return () => window.clearTimeout(timer);
  }, [delay, resetKey]);

  return compact;
}

export default V3SuccessFeedback;
