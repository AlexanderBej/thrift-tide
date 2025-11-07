import React from 'react';

import PeriodSwitcherMonthPicker from '../../../components/period-switcher/period-switcher.component';
import UserDropdown from '../../../components/user-dropdown/user-dropdown.component';
import { ReactComponent as Logo } from '../../../assets/logo.svg';
import { useLayoutTitle } from '../../../utils/use-layout-title.hook';

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
