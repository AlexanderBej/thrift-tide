/* eslint-disable no-unused-vars */
import React, { ReactNode, RefObject, useEffect, useRef, useState } from 'react';

import './dropdown.styles.scss';

// eslint-disable-next-line no-unused-vars
type Handler = (event: MouseEvent | TouchEvent) => void;

/**
 * Call `handler` whenever a click or touch starts outside `ref.current`.
 */
function useOnClickOutside<T extends HTMLElement>(ref: RefObject<T | null>, handler: Handler) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      // Do nothing if clicking ref's element or any of its descendants
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

interface GalDropdownProps {
  customClassName?: string;
  /** The element that toggles the dropdown open/closed */
  trigger: (props: { open: boolean; toggle: () => void }) => ReactNode;
  /** The actual dropdown menu, rendered only when open=true */
  menu: (props: { close: () => void }) => ReactNode;
}

const Dropdown: React.FC<GalDropdownProps> = ({ customClassName, trigger, menu }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const toggle = () => setOpen((o) => !o);
  const close = () => setOpen(false);

  useOnClickOutside(ref, close);
  return (
    <div ref={ref} className="dropdown-container">
      {trigger({ open, toggle })}
      {open && <div className={`dropdown-menu ${customClassName}`}>{menu({ close })}</div>}
    </div>
  );
};

export default Dropdown;
