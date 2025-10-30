import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Sidebar from '../../components-ui/nav/sidebar/sidebar.component';
import BottomNav from '../../components-ui/nav/bottom-nav/bottom-nav.component';
import UserDropdown from '../../components/user-dropdown/user-dropdown.component';
import AddTransaction from '../../components/add-transaction-modal/add-transaction-modal.component';
import PeriodSwitcherMonthPicker from '../../components/period-switcher/period-switcher.component';
import { selectAppBootState } from '../../store/app.selectors';

import './layout.styles.scss';
import PageSpinner from '../../components-ui/spinner/page-spinner/page-spinner.component';

const Layout: React.FC = () => {
  const { booting } = useSelector(selectAppBootState);

  const { pathname } = useLocation();

  const getTitle = (path: string) => {
    if (path === '/' || path === '') return 'Dashboard';
    const parts = path.replace(/^\/+/, '').split('/');
    const first = parts[0];

    return first.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="main-layout">
      <Sidebar />
      <main className="main-outlet">
        {booting ? (
          <PageSpinner />
        ) : (
          <>
            <header className="page-header">
              <div className="page-title-container">
                <h1 className="page-title">{getTitle(pathname)}</h1>
                <PeriodSwitcherMonthPicker className="page-header-monthpicker" />
              </div>
              <div className="page-user-dropdown">
                <UserDropdown />
              </div>
            </header>
            <div className="outlet-container">
              <Outlet />
              <BottomNav />
            </div>
            <div className="floater">
              <AddTransaction />
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Layout;
