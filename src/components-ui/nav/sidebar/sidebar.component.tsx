import React from 'react';
// import { NavLink } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

// import TTIcon from '../../icon/icon.component';
import { ReactComponent as Logo } from './../../../assets/logo.svg';
// import { NAV_ITEMS } from '../nav.config';
import { selectSettingsAppTheme } from '../../../store/settings-store/settings.selectors';
import { getCssVar } from '../../../utils/style-variable.util';
import { Themes } from '../../../api/types/settings.types';
import SidebarContent from '../../../components/sidebar-content/sidebar-content.component';

import './sidebar.styles.scss';

const Sidebar: React.FC = () => {
  // const { t } = useTranslation('common');
  const theme = useSelector(selectSettingsAppTheme);

  return (
    <aside
      className="main-sidebar"
      style={{
        backgroundColor:
          theme === Themes.LIGHT ? getCssVar('--color-secondary') : getCssVar('--color-bg-card'),
      }}
    >
      <div className="logo-container">
        <Logo className="logo" height={60} />
      </div>
      <SidebarContent />
      {/* <ul className="sidebar-links">
        {NAV_ITEMS.map((navItem) => (
          <li key={navItem.key}>
            <NavLink
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              to={navItem.to}
            >
              <TTIcon icon={navItem.icon} size={24} color={getCssVar('--color-text-primary')} />
              <span>{t(navItem.i18nLabel) ?? navItem.label}</span>
            </NavLink>
          </li>
        ))}
      </ul> */}
    </aside>
  );
};

export default Sidebar;
