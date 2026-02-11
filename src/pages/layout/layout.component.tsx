import React, { useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { PageSpinner } from '@shared/ui';
import { selectAppBootState } from '@store/app.selectors';
import { TopNav, BottomNav } from '@widgets';

import './layout.styles.scss';

const Layout: React.FC = () => {
  const { booting } = useSelector(selectAppBootState);

  const outletScrollRef = useRef<HTMLDivElement>(null); // 👈 add

  return (
    <div className="main-layout">
      {booting ? (
        <PageSpinner />
      ) : (
        <>
          <TopNav />
          <main className="outlet-container" ref={outletScrollRef}>
            <Outlet />
          </main>
          {/* <nav className="nav"> */}
          <BottomNav />
          {/* </nav> */}
        </>
      )}
    </div>
  );
};

export default Layout;
