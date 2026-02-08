import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaChevronLeft } from 'react-icons/fa';

import { TTIcon } from '@shared/ui';
import { routes } from '@shared/utils';

import './top-nav.styles.scss';
import { useTranslation } from 'react-i18next';

const TopNav: React.FC = () => {
  const { t } = useTranslation('common');
  const location = useLocation();
  const navigate = useNavigate();

  const isDashboard = location.pathname === '/';
  const title = routes.find((r) => r.path === location.pathname)?.title ?? '';

  return (
    <header className="app-header">
      {!isDashboard && (
        <div className="header-content">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <TTIcon icon={FaChevronLeft} size={18} />
          </button>
          <span className="page-title">{t(`pages.${title.toLowerCase()}`)}</span>
        </div>
      )}
    </header>
  );
};

export default TopNav;
