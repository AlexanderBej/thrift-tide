import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaPlus } from 'react-icons/fa';

import { Pressable, TTIcon } from '@shared/ui';
import { UserAvatar } from '@shared/components';
import { NAV_ITEMS, NavItem } from 'widgets/nav.config';

import './bottom-nav.styles.scss';

const BottomNav: React.FC = () => {
  const { t } = useTranslation(['common', 'budget']);
  const navigate = useNavigate();
  const location = useLocation();

  const mainNavLabel = String(t('common:navigation.main'));
  const addExpenseLabel = String(t('budget:capture.addExpense'));

  const onFabClick: React.MouseEventHandler<HTMLElement> = (event) => {
    event.currentTarget.blur();

    navigate('/transactions/new', {
      state: { from: location.pathname },
    });
  };

  const renderNavItem = (item: NavItem) => (
    <Pressable
      key={item.key}
      as="span"
      className="bottom-nav-item"
      haptic="light"
      ripple
      pressScale={0.96}
    >
      <NavLink
        to={item.to}
        end={item.to === '/'}
        className={({ isActive }) =>
          ['nav-link', `nav-link__${item.key}`, isActive && 'nav-link--active']
            .filter(Boolean)
            .join(' ')
        }
      >
        {item.key === 'profile' ? (
          <span className="nav-link-icon nav-link-avatar">
            <UserAvatar />
          </span>
        ) : (
          <span className="nav-link-icon">
            <TTIcon icon={item.icon} size={24} color="currentColor" />
          </span>
        )}

        <span className="nav-link-title">{t(item.i18nLabel)}</span>
      </NavLink>
    </Pressable>
  );

  return (
    <nav className="bottom-nav" aria-label={mainNavLabel}>
      {NAV_ITEMS.slice(0, 2).map(renderNavItem)}

      <div className="fab-space">
        <div className="fab-wrapper">
          <Pressable
            className="fab"
            haptic="medium"
            ripple
            pressScale={0.92}
            onClick={onFabClick}
            aria-label={addExpenseLabel}
          >
            <TTIcon icon={FaPlus} color="var(--color-bg-elevated)" size={18} />
          </Pressable>
        </div>
      </div>

      {NAV_ITEMS.slice(2).map(renderNavItem)}
    </nav>
  );
};

export default BottomNav;
