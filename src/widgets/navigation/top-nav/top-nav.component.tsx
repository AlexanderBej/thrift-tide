import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaChevronLeft } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import clsx from 'clsx';

import { Button } from '@shared/ui';
import { getRouteMeta } from '@shared/utils/routes.util';
import { PeriodWidget } from 'widgets/period-widget';
import { selectSettingsAppTheme } from '@store/settings-store';

import { ReactComponent as LogoLight } from '../../../assets/thrift_tide_logo-light.svg';
import { ReactComponent as LogoDark } from '../../../assets/thrift_tide_logo-dark.svg';

import './top-nav.styles.scss';

interface TopNavProps {
  hidden?: boolean;
}

const TopNav: React.FC<TopNavProps> = ({ hidden = false }) => {
  const { t } = useTranslation(['common', 'taxonomy']);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useSelector(selectSettingsAppTheme);

  const routeMeta = getRouteMeta(location.pathname);

  const handleBack = () => {
    if (!routeMeta?.backFallback) return;

    if (location.key === 'default') {
      navigate(routeMeta.backFallback, { replace: true });
      return;
    }

    navigate(-1);
  };

  return (
    <header
      className={clsx('app-header', {
        'app-header--hidden': hidden,
      })}
    >
      <div className="app-header-container app-header-container__left">
        {routeMeta?.showBack && (
          <Button
            variant="quiet"
            size="sm"
            icon={FaChevronLeft}
            haptic="light"
            className="back-btn"
            onClick={handleBack}
          >
            {t('common:actions.back')}
          </Button>
        )}
      </div>

      <div className="app-header-container center-container">
        {routeMeta?.dashboard ? (
          theme === 'dark' ? (
            <LogoDark height={30} />
          ) : (
            <LogoLight height={30} />
          )
        ) : routeMeta?.titleKey ? (
          <div className="page-title" role="heading" aria-level={1}>
            {t(routeMeta.titleKey)}
          </div>
        ) : null}
      </div>

      <div className="app-header-container app-header-container__right">
        {routeMeta?.showPeriod !== false && <PeriodWidget />}
      </div>
    </header>
  );
};

export default TopNav;
