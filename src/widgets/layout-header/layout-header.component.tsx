import React from 'react';

import { PeriodSwitcherMonthPicker, UserDropdown } from '@components';
import { ReactComponent as Logo } from '../../assets/logo.svg';
import { useLayoutTitle } from '@shared/hooks';

import './layout-header.styles.scss';

const LayoutHeader: React.FC = () => {
  const { isMobile, title } = useLayoutTitle();

  return (
    <header className="main-header">
      {isMobile ? (
        <>
          <div className="row1">
            <Logo className="logo" height={40} />
            <h1 className="page-title">{title}</h1>
            <UserDropdown />
          </div>
          <div className="row2">
            <PeriodSwitcherMonthPicker className="page-header-monthpicker" />
          </div>
        </>
      ) : (
        <>
          <div className="page-title-container">
            <h1 className="page-title">{title}</h1>
            <PeriodSwitcherMonthPicker className="page-header-monthpicker" />
          </div>
          <div className="page-user-dropdown">
            <UserDropdown />
          </div>
        </>
      )}
    </header>
  );
};

export default LayoutHeader;
