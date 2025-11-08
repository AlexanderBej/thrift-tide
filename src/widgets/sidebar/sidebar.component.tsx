import React from 'react';
import { useSelector } from 'react-redux';

import { ReactComponent as Logo } from '../../assets/logo.svg';
import { getCssVar } from '@shared/utils';
import { Themes } from '@api/types';
import { SidebarContent } from '@components';
import { selectSettingsAppTheme } from '@store/settings-store';

import './sidebar.styles.scss';

const Sidebar: React.FC = () => {
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
    </aside>
  );
};

export default Sidebar;
