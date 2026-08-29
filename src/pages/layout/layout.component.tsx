import React, { useRef } from 'react';
import { Outlet } from 'react-router-dom';

import { TopNav, BottomNav } from '@widgets';

import './layout.styles.scss';

const Layout: React.FC = () => {
  const outletScrollRef = useRef<HTMLDivElement>(null); // 👈 add

  return (
    <div className="main-layout">
      <TopNav />
      <main className="outlet-container" ref={outletScrollRef}>
        <Outlet />
      </main>
      {/* <nav className="nav"> */}
      <BottomNav />
      {/* </nav> */}
    </div>
  );
};

export default Layout;
