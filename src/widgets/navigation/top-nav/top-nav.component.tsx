import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaChevronLeft } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

import { TTIcon } from '@shared/ui';
import { getCssVar, routes } from '@shared/utils';
import { ReactComponent as Logo } from '../../../assets/logo.svg';
import { PeriodWidget } from 'widgets/period-widget';

import './top-nav.styles.scss';

const TopNav: React.FC = () => {
  const { t } = useTranslation('common');
  const location = useLocation();
  const navigate = useNavigate();

  const isDashboard = location.pathname === '/';
  const isHistory = location.pathname === '/history';
  const title = routes.find((r) => r.path === location.pathname)?.title ?? '';

  const showBackBtn = location.pathname.includes('categories') || isHistory;
  const showPeriodWidget = !isDashboard && !isHistory;

  return (
    <header className="app-header">
      <div className="app-header-container app-header-container__left">
        {showBackBtn && (
          <button className="back-btn" onClick={() => navigate(-1)}>
            <TTIcon icon={FaChevronLeft} size={16} color={getCssVar('--color-primary')} />
            <span className="back-btn-text">{t('actions.back')}</span>
          </button>
        )}
      </div>
      <div className="app-header-container center-container">
        {isDashboard ? (
          <Logo height={40} />
        ) : (
          <span className="page-title">{t(`pages.${title.toLowerCase()}`)}</span>
        )}
      </div>
      <div className="app-header-container app-header-container__right">
        {showPeriodWidget && <PeriodWidget />}
      </div>
    </header>
  );
};

export default TopNav;
