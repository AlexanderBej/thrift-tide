import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaChevronLeft } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { TTIcon } from '@shared/ui';
import { routes } from '@shared/utils';
import { PeriodWidget } from 'widgets/period-widget';
import { selectSettingsAppTheme } from '@store/settings-store';

import { ReactComponent as LogoLight } from '../../../assets/thrift_tide_logo-light.svg';
import { ReactComponent as LogoDark } from '../../../assets/thrift_tide_logo-dark.svg';

import './top-nav.styles.scss';

const TopNav: React.FC = () => {
  const { t } = useTranslation('common');
  const location = useLocation();
  const navigate = useNavigate();

  const theme = useSelector(selectSettingsAppTheme);

  const isDashboard = location.pathname === '/';
  const isHistory = location.pathname === '/history';
  const title = routes.find((r) => r.path === location.pathname)?.title ?? '';

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
          <span className="page-title">{t(`pages.${title.toLowerCase()}`)}</span>
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

export default TopNav;
