import React from 'react';
import { NavLink } from 'react-router-dom';

import TTIcon from '../../icon/icon.component';
import { NAV_ITEMS } from '../nav.config';

import './bottom-nav.styles.scss';

const BottomNav: React.FC = () => {
  return (
    <nav className="bottom-nav">
      <ul className="nav-links">
        {NAV_ITEMS.map((navItem) => (
          <li key={navItem.key}>
            <NavLink
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              to={navItem.to}
            >
              <TTIcon icon={navItem.icon} size={32} />
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default BottomNav;
