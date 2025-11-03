import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Sidebar from '../../components-ui/nav/sidebar/sidebar.component';
import BottomNav from '../../components-ui/nav/bottom-nav/bottom-nav.component';
import UserDropdown from '../../components/user-dropdown/user-dropdown.component';
import AddTransaction from '../../components/add-transaction-modal/add-transaction-modal.component';
import PeriodSwitcherMonthPicker from '../../components/period-switcher/period-switcher.component';
import { selectAppBootState } from '../../store/app.selectors';
import PageSpinner from '../../components-ui/spinner/page-spinner/page-spinner.component';

import './layout.styles.scss';

const PATH_TITLES: Record<string, string> = {
  '': 'pages.dashboard',
  dashboard: 'pages.dashboard',
  buckets: 'pages.buckets',
  bucket: 'pages.bucket',
  transactions: 'pages.transactions',
  insights: 'pages.insights',
  history: 'pages.history',
  settings: 'pages.settings',
};

const Layout: React.FC = () => {
  const { booting } = useSelector(selectAppBootState);
  const { t } = useTranslation('common');

  const { pathname } = useLocation();

  const getTitle = (path: string) => {
    const parts = path.replace(/^\/+/, '').split('/');
    const first = parts[0] ?? '';

    // 1️⃣ Look up known route
    const key = PATH_TITLES[first] || PATH_TITLES[''];
    if (key) return t(key);

    return first
      ? first.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      : t('pages.dashboard');
  };

  const logSomething = () => {
    console.log('GET GERE?');
  };

  return (
    <div className="main-layout">
      <Sidebar />
      <main className="main-outlet">
        {booting ? (
          <>
            {logSomething()}
            <PageSpinner />
          </>
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
