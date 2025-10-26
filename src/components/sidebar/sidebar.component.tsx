import React from 'react';
import { NavLink } from 'react-router-dom';

import TTIcon from '../icon/icon.component';
// import { ReactComponent as Logo } from './../../assets/logo.svg';
import { RxDashboard } from 'react-icons/rx';
import { MdOutlineCategory } from 'react-icons/md';
import { GrTransaction } from 'react-icons/gr';
import { CiSettings } from 'react-icons/ci';

import './sidebar.styles.scss';

const Sidebar: React.FC = () => {
  return (
    <aside className="main-sidebar">
      <div className="logo-container">{/* <Logo className="logo" height={60} /> */}</div>
      {/* <hr className="sidebar-line"></hr> */}
      <ul className="sidebar-links">
        <li>
          <NavLink
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            to={'/'}
          >
            <TTIcon icon={RxDashboard} size={24} />
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            to={'categories'}
          >
            <TTIcon icon={MdOutlineCategory} size={24} />
            Categories
          </NavLink>
        </li>
        <li>
          <NavLink
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            to={'transactions'}
          >
            <TTIcon icon={GrTransaction} size={24} />
            Transactions
          </NavLink>
        </li>
        <li>
          <NavLink
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            to={'settings'}
          >
            <TTIcon icon={CiSettings} size={24} />
            Settings
          </NavLink>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
