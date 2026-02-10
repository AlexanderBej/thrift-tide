import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaPlus } from 'react-icons/fa';

import { getCssVar } from '@shared/utils';
import { TTIcon } from '@shared/ui';
import { AddActionSheet } from '@widgets';
import { UserAvatar } from '@shared/components';
import { NAV_ITEMS, NavItem } from 'widgets/nav.config';

import './bottom-nav.styles.scss';

const BottomNav: React.FC = () => {
  const { t } = useTranslation('common');
  const [open, setOpen] = useState<boolean>(false);

  const dashboard = NAV_ITEMS.find((item) => item.key === 'dashboard');
  const txns = NAV_ITEMS.find((item) => item.key === 'txns');
  const insights = NAV_ITEMS.find((item) => item.key === 'insights');
  const profile = NAV_ITEMS.find((item) => item.key === 'profile');

  const onFabClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // release focus BEFORE Radix hides the app root
    (e.currentTarget as HTMLButtonElement).blur();
    setOpen(true);
  };

  const getNavItem = (item: NavItem | undefined) => {
    if (!item) return;
    return (
      <NavLink className={`nav-link nav-link__${item.key}`} to={item.to}>
        {({ isActive }) => (
          <>
            {item.key === 'profile' ? (
              <UserAvatar />
            ) : (
              <TTIcon
                icon={item.icon}
                size={24}
                color={isActive ? getCssVar('--color-primary') : getCssVar('--color-text-primary')}
              />
            )}
            {item.key !== 'profile' && (
              <span
                className="nav-link-title"
                style={{
                  color: isActive
                    ? getCssVar('--color-primary')
                    : getCssVar('--color-text-primary'),
                }}
              >
                {t(item.i18nLabel)}
              </span>
            )}
          </>
        )}
      </NavLink>
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
              <TTIcon icon={FaPlus} color={getCssVar('--color-bg-card')} size={18} />
            </button>
          </div>
        </div>

        {getNavItem(insights)}
        {getNavItem(profile)}
        <AddActionSheet open={open} onOpenChange={setOpen} />
      </nav>
    </>
  );
};

export default BottomNav;
