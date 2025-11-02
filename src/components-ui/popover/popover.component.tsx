import React, { useEffect, useRef, useState } from 'react';

import './popover.styles.scss';

interface PopoverProps {
  toggler: React.ReactElement;
  children: React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

const Popover: React.FC<PopoverProps> = ({ toggler, children, position = 'bottom', className }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);
  return (
    <div ref={ref} className={`popover ${className || ''}`}>
      <button type="button" onClick={() => setOpen((v) => !v)} className="popover-toggler">
        {toggler}
      </button>
      {open && (
        <div
          className={`popover-container ${
            position === 'top'
              ? 'popover-container__top'
              : position === 'right'
                ? 'popover-container__right'
                : position === 'bottom'
                  ? 'popover-container__bottom'
                  : 'popover-container__left'
          }`}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default Popover;
