import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { useWindowWidth } from '@shared/hooks';
import { PageSpinner } from '@shared/ui';
import { selectAppBootState } from '@store/app.selectors';
import { Drawer, LayoutHeader, Sidebar, BottomNav } from '@widgets';

import './layout.styles.scss';

const Layout: React.FC = () => {
  const location = useLocation();
  const { booting } = useSelector(selectAppBootState);

  const width = useWindowWidth();
  const isMobile = width < 480;

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
            {!hideSettingsOnMobile() && <LayoutHeader />}
            <Drawer />
            <main className="outlet-container">
              <Outlet />
            </main>
            <BottomNav />
            {/* <div className="floater">
              <AddTransaction />
            </div> */}
          </>
        )}
      </div>
    </div>
  );
};

export default Layout;
