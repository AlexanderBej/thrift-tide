import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';

import { AddTransaction, PeriodSwitcherMonthPicker, UserDropdown } from '@components';
import { ReactComponent as Logo } from '../../assets/logo.svg';
import { useHideOnScroll, useLayoutTitle } from '@shared/hooks';

import './top-nav.styles.scss';

interface TopNavProps {
  scrollTargetRef?: React.RefObject<HTMLElement | null>;
}

const TopNav: React.FC<TopNavProps> = ({ scrollTargetRef }) => {
  const { isMobile, title } = useLayoutTitle();

  const headerRef = useRef<HTMLElement>(null);

  const { hidden, condensed, elevated } = useHideOnScroll({
    enabled: isMobile,
    target: scrollTargetRef?.current ?? null,
    hideOffset: 80,
    condenseAt: 120,
    elevateAt: 8,
    // On desktop, keep a subtle shadow and no animation states
    defaults: { hidden: false, condensed: false, elevated: true },
  });

  // 👇 sync CSS variable --header-h on the header's parent (main-outlet)
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const setH = () => {
      const rect = header.getBoundingClientRect();
      // ✅ write to the root element so siblings can see it
      document.documentElement.style.setProperty('--header-h', `${Math.round(rect.height)}px`);
    };

    // initial after paint
    const raf = requestAnimationFrame(setH);

    // keep in sync
    const ro = new ResizeObserver(setH);
    ro.observe(header);

    window.addEventListener('resize', setH);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('resize', setH);
    };
  }, []);

  const headerClass = clsx(
    'main-header',
    isMobile ? 'main-header--mobile' : 'main-header--desktop',
    { 'is-hidden': hidden, 'is-condensed': condensed, 'is-elevated': elevated },
  );

  return (
    <>
      <header ref={headerRef} className={headerClass}>
        {isMobile ? (
          <>
            <div className="row1">
              <Logo className="logo" height={40} />
              <h1 className="page-title">{title}</h1>
              <div className="user-btn">
                <UserDropdown />
              </div>
            </div>
            <div className="row2">
              <PeriodSwitcherMonthPicker className="page-header-monthpicker" />
            </div>
          </>
        ) : (
          <>
            <div className="page-title-container">
              <h1 className="page-title">{title}</h1>
              <PeriodSwitcherMonthPicker className="page-header-monthpicker" />
            </div>
            <AddTransaction />
            <div className="page-user-dropdown">
              <UserDropdown />
            </div>
          </>
        )}
      </header>
      <div className="main-header-spacer" />
    </>
  );
};

export default TopNav;
