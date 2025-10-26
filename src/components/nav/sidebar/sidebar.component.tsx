import React from 'react';
import { NavLink } from 'react-router-dom';

import TTIcon from '../../icon/icon.component';
import { ReactComponent as Logo } from './../../../assets/logo.svg';
import { NAV_ITEMS } from '../nav.config';

import './sidebar.styles.scss';

const Sidebar: React.FC = () => {
  return (
    <aside className="main-sidebar">
      <div className="logo-container">
        <Logo className="logo" height={60} />
      </div>
      <ul className="sidebar-links">
        {NAV_ITEMS.map((navItem) => (
          <li key={navItem.key}>
            <NavLink
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              to={navItem.to}
            >
              <TTIcon icon={navItem.icon} size={24} />
              <span>{navItem.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
