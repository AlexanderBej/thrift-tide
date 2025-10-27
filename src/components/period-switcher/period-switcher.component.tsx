import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectBudgetMonth } from '../../store/budget-store/budget.selectors.base';
import { changeMonthThunk } from '../../store/budget-store/budget.slice';
import { selectAuthUser } from '../../store/auth-store/auth.selectors';
import { selectSettingsBudgetStartDay } from '../../store/settings-store/settings.selectors';
import { representativeDateFromMonthKey } from '../../utils/period.util';
import MonthPicker from '../../components-ui/datepicker/monthpicker.component';

function toMonthKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

const PeriodSwitcherMonthPicker: React.FC<{
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  label?: string;
}> = ({ className, minDate, maxDate, label = '' }) => {
  const dispatch = useDispatch<any>();
  const uid = useSelector(selectAuthUser)?.uuid;

  const monthKey = useSelector(selectBudgetMonth);
  const startDay = useSelector(selectSettingsBudgetStartDay);

  // Show the representative date (startDay of that month) in the control
  const value = React.useMemo(
    () => representativeDateFromMonthKey(monthKey, startDay),
    [monthKey, startDay],
  );

  const onPick = (d: Date | null) => {
    if (!uid || !d) return;
    const mk = toMonthKey(d);
    dispatch(changeMonthThunk({ uid, month: mk }));
  };

  return (
    <MonthPicker
      className={className}
      label={label}
      value={value}
      onMonthPick={onPick}
      startDay={startDay}
      minDate={minDate}
      maxDate={maxDate}
      placeholder="Select month"
    />
  );
};

export default PeriodSwitcherMonthPicker;
