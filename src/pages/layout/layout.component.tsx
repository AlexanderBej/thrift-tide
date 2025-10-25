import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import Sidebar from '../../components/sidebar/sidebar.component';
import UserDropdown from '../../components/dropdowns/user-dropdown/user-dropdown.component';

import './layout.styles.scss';

const Layout: React.FC = () => {
  const { pathname } = useLocation();

  const getTitle = (path: string) => {
    if (path === '/' || path === '') return 'Dashboard';

    // Remove leading slash and split nested paths if needed
    const parts = path.replace(/^\/+/, '').split('/');

    // Take only last part (e.g. "/categories/edit" → "edit")
    const first = parts[0];

    // console.log('parts', parts);

    // Convert kebab-case or snake_case to Proper Case
    return first.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="main-layout">
      <Sidebar />
      <main className="main-outlet">
        <div className="user-bar">
          <h1>{getTitle(pathname)}</h1>
          <UserDropdown />
        </div>
        <div className="outlet-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
