import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { NAV_ITEMS } from '../../widgets/nav.config';
import { getCssVar } from '@shared/utils';
import { TTIcon } from '@shared/ui';
import { AppDispatch } from '@store/store';
import { drawerClose, selectUIDrawerOpen } from '@store/ui-store';

import './sidebar-content.styles.scss';

const SidebarContent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation('common');
  const isOpen = useSelector(selectUIDrawerOpen);

  const handleDrawerClose = () => {
    if (isOpen) {
      dispatch(drawerClose());
    }
  };

  return (
    <ul className="sidebar-links">
      {NAV_ITEMS.map((navItem) => (
        <li key={navItem.key}>
          <NavLink
            onClick={handleDrawerClose}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            to={navItem.to}
          >
            <TTIcon icon={navItem.icon} size={24} color={getCssVar('--color-text-primary')} />
            <span>{t(navItem.i18nLabel) ?? navItem.label}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  );
};

export default SidebarContent;
