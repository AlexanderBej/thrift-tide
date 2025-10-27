import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';

import Sidebar from '../../components-ui/nav/sidebar/sidebar.component';
import MonthPicker from '../../components-ui/datepicker/monthpicker.component';
import { AppDispatch } from '../../store/store';
import { setMonth } from '../../store/budget-store/budget.slice';
import BottomNav from '../../components-ui/nav/bottom-nav/bottom-nav.component';
import { selectBudgetMonth } from '../../store/budget-store/budget.selectors.base';
import { selectMonthTiming } from '../../store/budget-store/budget-period.selectors';
import UserDropdown from '../../components/user-dropdown/user-dropdown.component';
import AddTransaction from '../../components/add-transaction-modal/add-transaction-modal.component';
import { formatPeriodRange } from '../../utils/period.util';
import PeriodSwitcherMonthPicker from '../../components/period-switcher/period-switcher.component';

import './layout.styles.scss';

const Layout: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { pathname } = useLocation();
  const month = useSelector(selectBudgetMonth);
  const { periodStart, periodEnd } = useSelector(selectMonthTiming);

  const [pickedMonth, setPickedMonth] = useState<Date>(new Date(month));

  const handleDateChange = (d: Date | null) => {
    if (!d) return;
    setPickedMonth(d);
    dispatch(setMonth(format(d, 'yyyy-MM')));
  };

  const getTitle = (path: string) => {
    if (path === '/' || path === '') return 'Dashboard';
    const parts = path.replace(/^\/+/, '').split('/');
    const first = parts[0];

    return first.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="main-layout">
      <Sidebar />
      <main className="main-outlet">
        <header className="page-header">
          <div className="page-title-container">
            <h1 className="page-title">{getTitle(pathname)}</h1>
            <PeriodSwitcherMonthPicker className="page-header-monthpicker" />
          </div>
          <div className="page-user-dropdown">
            <UserDropdown />
          </div>
        </header>
        <div className="outlet-container">
          <Outlet />
          <BottomNav />
        </div>
        <div className="floater">
          <AddTransaction />
        </div>
      </main>
    </div>
  );
};

export default Layout;
