import React, { useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { useWindowWidth } from '@shared/hooks';
import { PageSpinner } from '@shared/ui';
import { selectAppBootState } from '@store/app.selectors';
import { Drawer, TopNav, Sidebar, BottomNav } from '@widgets';

import './layout.styles.scss';

const Layout: React.FC = () => {
  const location = useLocation();
  const { booting } = useSelector(selectAppBootState);

  const width = useWindowWidth();
  const isMobile = width < 480;

  const outletScrollRef = useRef<HTMLDivElement>(null); // 👈 add

  const hideSettingsOnMobile = () => {
    return isMobile && location.pathname.includes('settings');
  };
  return (
    <div className="main-layout">
      <Sidebar />
      <div className="main-outlet">
        {booting ? (
          <PageSpinner />
        ) : (
          <>
            {!hideSettingsOnMobile() && <TopNav scrollTargetRef={outletScrollRef} />}
            <Drawer />
            <main className="outlet-container" ref={outletScrollRef}>
              <Outlet />
            </main>
            <BottomNav />
          </>
        )}
      </div>
    </div>
  );
};

export default Layout;
