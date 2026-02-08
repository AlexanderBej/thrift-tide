import React from 'react';
import { useTranslation } from 'react-i18next';

import { ExpenseGroupOption } from '@api/models';
import { TTIcon } from '@shared/ui';

import './expense-group-name.styles.scss';

interface ExpenseGroupNameProps {
  expenseGroup: ExpenseGroupOption;
  note?: string;
}

const ExpenseGroupName: React.FC<ExpenseGroupNameProps> = ({ expenseGroup, note }) => {
  const { t } = useTranslation('budget');

  return (
    <div className="expense-group-row">
      <div className="expense-group-icon-wrapper" style={{ backgroundColor: expenseGroup.color }}>
        <TTIcon icon={expenseGroup.icon} color="white" size={18} />
      </div>
      <div className="expense-group-label-wrapper">
        <span className="expense-group-label">
          {t(expenseGroup.i18nLabel) ?? expenseGroup.label}
        </span>
        {note && <span className="note">{note}</span>}
      </div>
    </div>
  );
};

export default ExpenseGroupName;
