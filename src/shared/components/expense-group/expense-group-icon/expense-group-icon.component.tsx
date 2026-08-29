import React from 'react';
import { useSelector } from 'react-redux';
import clsx from 'clsx';

import { ExpenseGroupOption } from '@api/models';
import { TTIcon } from '@shared/ui';
import { selectSettingsAppTheme } from '@store/settings-store';

import './expense-group-icon.styles.scss';

interface ExpenseGroupIconProps {
  expenseGroup: ExpenseGroupOption;
}

const ExpenseGroupIcon: React.FC<ExpenseGroupIconProps> = ({ expenseGroup }) => {
  const theme = useSelector(selectSettingsAppTheme);

  return (
    <div
      className={clsx('expense-group-icon-wrapper', `expense-group-icon-wrapper__${theme}`)}
      style={{ backgroundColor: expenseGroup.color }}
    >
      <TTIcon icon={expenseGroup.icon} color="white" size={18} />
    </div>
  );
};

export default ExpenseGroupIcon;
