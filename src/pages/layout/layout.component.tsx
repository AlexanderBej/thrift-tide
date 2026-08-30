import React, { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { TopNav, BottomNav } from '@widgets';
import { useHideOnScroll } from '@shared/hooks';

import './layout.styles.scss';

const Layout: React.FC = () => {
  const outletScrollRef = useRef<HTMLElement | null>(null);
  const location = useLocation();

  const { hidden: topNavHidden, forceShow: showTopNav } = useHideOnScroll(outletScrollRef);

  useEffect(() => {
    showTopNav();
  }, [location.pathname, showTopNav]);

  return (
    <div className="main-layout">
      <TopNav hidden={topNavHidden} />
      <main ref={outletScrollRef} className="outlet-container">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default Layout;
