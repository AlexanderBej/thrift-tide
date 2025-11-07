import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import PeriodSwitcherMonthPicker from '../../../components/period-switcher/period-switcher.component';
import UserDropdown from '../../../components/user-dropdown/user-dropdown.component';
import { ReactComponent as Logo } from '../../../assets/logo.svg';

import './layout-header.styles.scss';
import { useWindowWidth } from '../../../utils/window-width.hook';

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

const LayoutHeader: React.FC = () => {
  const { t } = useTranslation('common');
  const { pathname } = useLocation();
  const width = useWindowWidth();
  const isMobile = width < 480;

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
  return (
    <header className="main-header">
      {isMobile ? (
        <>
          <div className="row1">
            <Logo className="logo" height={40} />
            <h1 className="page-title">{getTitle(pathname)}</h1>
            <UserDropdown />
          </div>
          <div className="row2">
            <PeriodSwitcherMonthPicker className="page-header-monthpicker" />
          </div>
        </>
      ) : (
        <>
          <div className="page-title-container">
            <h1 className="page-title">{getTitle(pathname)}</h1>
            <PeriodSwitcherMonthPicker className="page-header-monthpicker" />
          </div>
          <div className="page-user-dropdown">
            <UserDropdown />
          </div>
        </>
      )}
    </header>
  );
};

export default LayoutHeader;
