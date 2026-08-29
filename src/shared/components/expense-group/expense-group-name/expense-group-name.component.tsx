import React from 'react';
import { useTranslation } from 'react-i18next';

import { ExpenseGroupOption } from '@api/models';
import { ExpenseGroupIcon } from '../expense-group-icon';

import './expense-group-name.styles.scss';

interface ExpenseGroupNameProps {
  expenseGroup: ExpenseGroupOption;
  note?: string;
  notePrimary?: boolean;
}

const ExpenseGroupName: React.FC<ExpenseGroupNameProps> = ({ expenseGroup, note, notePrimary = false }) => {
  const { t } = useTranslation('budget');
  const groupLabel = t(expenseGroup.i18nLabel) ?? expenseGroup.label;
  const trimmedNote = note?.trim();
  const primary = notePrimary && trimmedNote ? trimmedNote : groupLabel;
  const secondary = notePrimary && trimmedNote ? groupLabel : trimmedNote;

  return (
    <div className="expense-group-row">
      <ExpenseGroupIcon expenseGroup={expenseGroup} />
      <div className="expense-group-label-wrapper">
        <span className="expense-group-label">{primary}</span>
        {secondary && <span className="note">{secondary}</span>}
      </div>
    </div>
  );
};

export default ExpenseGroupName;
