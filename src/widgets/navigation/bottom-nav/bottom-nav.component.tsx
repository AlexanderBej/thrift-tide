import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaPlus } from 'react-icons/fa';

import { Pressable, TTIcon } from '@shared/ui';
import { UserAvatar } from '@shared/components';
import { NAV_ITEMS, NavItem } from 'widgets/nav.config';

import './bottom-nav.styles.scss';

const BottomNav: React.FC = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const location = useLocation();

  const dashboard = NAV_ITEMS.find((item) => item.key === 'dashboard');
  const txns = NAV_ITEMS.find((item) => item.key === 'txns');
  const insights = NAV_ITEMS.find((item) => item.key === 'insights');
  const profile = NAV_ITEMS.find((item) => item.key === 'profile');

  const onFabClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    (e.currentTarget as HTMLButtonElement).blur();
    navigate('/transactions/new', { state: { from: location.pathname } });
  };

  const getNavItem = (item: NavItem | undefined) => {
    if (!item) return;
    return (
      <Pressable className="btnPrimary heet-btn" haptic="medium" ripple={true}>
        <NavLink className={`nav-link nav-link__${item.key}`} to={item.to}>
          {({ isActive }) => (
            <>
              {item.key === 'profile' ? (
                <UserAvatar />
              ) : (
                <TTIcon
                  icon={item.icon}
                  size={24}
                  color={isActive ? 'var(--color-primary)' : 'var(--color-text-primary)'}
                />
              )}
              {item.key !== 'profile' && (
                <span
                  className="nav-link-title"
                  style={{
                    color: isActive ? 'var(--color-primary)' : 'var(--color-text-primary)',
                  }}
                >
                  {t(item.i18nLabel)}
                </span>
              )}
            </>
          )}
        </NavLink>
      </Pressable>
    );
  };

  return (
    <>
      <nav className="bottom-nav">
        {getNavItem(dashboard)}
        {getNavItem(txns)}

        <div className="fab-space">
          <div className="fab-wrapper">
            <button onClick={onFabClick} className="fab">
              <TTIcon icon={FaPlus} color="var(--color-bg-elevated)" size={18} />
            </button>
          </div>
        </div>
        {getNavItem(insights)}
        {getNavItem(profile)}
      </nav>
    </>
  );
};

export default BottomNav;
