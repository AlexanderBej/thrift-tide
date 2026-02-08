import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import clsx from 'clsx';

import './expansion-panel.styles.scss';

interface ExpansionPanelProps {
  title: React.ReactNode;
  defaultOpen?: boolean;
  controlledOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

const ExpansionPanel: React.FC<ExpansionPanelProps> = ({
  title,
  defaultOpen = false,
  controlledOpen,
  onOpenChange,
  disabled = false,
  children,
  className,
  headerClassName,
  contentClassName,
}) => {
  const isControlled = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const contentId = useId();
  const buttonId = useId();

  const contentInnerRef = useRef<HTMLDivElement | null>(null);
  const [maxH, setMaxH] = useState(0);

  useLayoutEffect(() => {
    if (!contentInnerRef.current) return;
    if (open) {
      setMaxH(contentInnerRef.current.scrollHeight);
    } else {
      setMaxH(0);
    }
  }, [open, children]);

  // keep it correct if layout changes (fonts/resize)
  useEffect(() => {
    if (!contentInnerRef.current) return;
    const el = contentInnerRef.current;

    const ro = new ResizeObserver(() => {
      if (open) setMaxH(el.scrollHeight);
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, [open]);

  const setOpen = (next: boolean) => {
    if (disabled) return;
    if (!isControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  return (
    <div
      className={clsx('exp-panel', className)}
      data-open={open ? 'true' : 'false'}
      data-disabled={disabled ? 'true' : 'false'}
    >
      <button
        id={buttonId}
        type="button"
        className={clsx('exp-panel-header', headerClassName)}
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen(!open)}
        disabled={disabled}
      >
        {title}
      </button>

      <div
        id={contentId}
        role="region"
        aria-labelledby={buttonId}
        className={clsx('exp-panel-content', contentClassName)}
        style={{ maxHeight: maxH }}
      >
        <div ref={contentInnerRef} className="exp-panel-contentInner">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ExpansionPanel;
