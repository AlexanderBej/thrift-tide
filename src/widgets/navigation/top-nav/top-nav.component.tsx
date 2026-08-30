import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaChevronLeft } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { TTIcon } from '@shared/ui';
import { routes } from '@shared/utils/routes.util';
import { PeriodWidget } from 'widgets/period-widget';
import { selectSettingsAppTheme } from '@store/settings-store';

import { ReactComponent as LogoLight } from '../../../assets/thrift_tide_logo-light.svg';
import { ReactComponent as LogoDark } from '../../../assets/thrift_tide_logo-dark.svg';

import './top-nav.styles.scss';

const TopNav: React.FC = () => {
  const { t } = useTranslation(['common', 'taxonomy']);
  const location = useLocation();
  const navigate = useNavigate();

  const theme = useSelector(selectSettingsAppTheme);

  const isDashboard = location.pathname === '/';
  const isHistory = location.pathname === '/history';
  const title = getTopNavTitle(location.pathname);

  const showBackBtn = location.pathname.includes('categories') || isHistory;

  return (
    <header className="app-header">
      <div className="app-header-container app-header-container__left">
        {showBackBtn && (
          <button className="back-btn" onClick={() => navigate(-1)}>
            <TTIcon icon={FaChevronLeft} size={16} color="var(--color-primary)" />
            <span className="back-btn-text">{t('actions.back')}</span>
          </button>
        )}
      </div>
      <div className="app-header-container center-container">
        {!isDashboard ? (
          <span className="page-title">{t(title)}</span>
        ) : theme === 'dark' ? (
          <LogoDark height={40} />
        ) : (
          <LogoLight height={40} />
        )}
      </div>
      <div className="app-header-container app-header-container__right">
        {!isHistory && <PeriodWidget />}
      </div>
    </header>
  );
};

function getTopNavTitle(pathname: string) {
  const category = pathname.match(/^\/categories\/(needs|wants|savings)$/)?.[1];
  if (category) return `taxonomy:categoryNames.${category}`;

  const routeTitle = routes.find((r) => r.path === pathname)?.title ?? '';
  return routeTitle ? `common:pages.${routeTitle.toLowerCase()}` : '';
}

export default TopNav;
