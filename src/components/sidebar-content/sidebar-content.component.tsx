import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { NAV_ITEMS } from '../../components-ui/nav/nav.config';
import { getCssVar } from '../../utils/style-variable.util';
import TTIcon from '../../components-ui/icon/icon.component';

import './sidebar-content.styles.scss';
import { useDispatch, useSelector } from 'react-redux';
import { selectUIDrawerOpen } from '../../store/ui-store/ui.selectors';
import { AppDispatch } from '../../store/store';
import { drawerClose } from '../../store/ui-store/ui.slice';

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
