import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Sidebar from '../../components-ui/nav/sidebar/sidebar.component';
import BottomNav from '../../components-ui/nav/bottom-nav/bottom-nav.component';
import { selectAppBootState } from '../../store/app.selectors';
import PageSpinner from '../../components-ui/spinner/page-spinner/page-spinner.component';
import LayoutHeader from './layout-header/layout-header.component';
import { useWindowWidth } from '../../utils/window-width.hook';
import Drawer from './drawer/drawer.componen';

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
