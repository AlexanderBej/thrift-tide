import React from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CiCircleMore } from 'react-icons/ci';

import { NavItem, NAV_ITEMS } from '../nav.config';
import { AddTransaction } from '@components';
import { getCssVar } from '@shared/utils';
import { TTIcon } from '@shared/ui';
import { AppDispatch } from '@store/store';
import { selectSettingsAppTheme } from '@store/settings-store';
import { drawerOpen } from '@store/ui-store';
import { Themes } from '@api/types';

import './bottom-nav.styles.scss';

const BottomNav: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useSelector(selectSettingsAppTheme);

  const dashboard = NAV_ITEMS.find((item) => item.key === 'dashboard');
  const txns = NAV_ITEMS.find((item) => item.key === 'txns');
  const insights = NAV_ITEMS.find((item) => item.key === 'insights');

  const getNavItem = (item: NavItem | undefined) => {
    if (!item) return;
    return (
      <li>
        <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to={item.to}>
          <TTIcon icon={item.icon} size={24} color={getCssVar('--color-text-primary')} />
        </NavLink>
      </li>
    );
  };

  const handleDrawerOpen = () => {
    dispatch(drawerOpen());
  };

  return (
    <nav className="bottom-nav">
      <div
        className="nav-row"
        style={{
          backgroundColor:
            theme === Themes.LIGHT ? getCssVar('--color-secondary') : getCssVar('--color-bg-card'),
        }}
      >
        <ul className="nav-links">
          <div className="inline">
            {getNavItem(dashboard)}
            {getNavItem(txns)}
          </div>

          <li className="fab">
            <AddTransaction />
          </li>
          <div className="inline">
            {getNavItem(insights)}
            <li>
              <button className="nav-link" onClick={() => handleDrawerOpen()}>
                <TTIcon icon={CiCircleMore} size={24} color={getCssVar('--color-text-primary')} />
              </button>
            </li>
          </div>
        </ul>
      </div>
    </nav>
  );
};

export default BottomNav;
