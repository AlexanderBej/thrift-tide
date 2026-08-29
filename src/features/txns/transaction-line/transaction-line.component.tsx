import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFormatMoney } from '@shared/hooks';
import { ExpenseGroupName } from '@shared/components/expense-group/expense-group-name';
import { ExpenseGroupOption, Txn } from '@api/models';

import './transaction-line.styles.scss';
import { LOCALE_MAP, makeFormatter, toYMD } from '@shared/utils/format-data.util';

interface TransactionLineProps {
  expenseGroup: ExpenseGroupOption;
  txn: Txn;
  showDate?: boolean;
  variant?: 'date' | 'expenseGroup';
}

const TransactionLine: React.FC<TransactionLineProps> = ({
  expenseGroup,
  txn,
  variant = 'date',
}) => {
  const { t, i18n } = useTranslation('budget');
  const fmtMoney = useFormatMoney(false);

  const getFormattedDate = (date: any) => {
    const dateObj = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (toYMD(dateObj) === toYMD(today)) return t('common:dates.today') ?? 'Today';
    if (toYMD(dateObj) === toYMD(yesterday)) return t('common:dates.yesterday') ?? 'Yesterday';

    const locale = LOCALE_MAP[i18n.language] ?? 'en-US';

    const fmt = makeFormatter(locale);
    return fmt.format(dateObj);
  };

  return (
    <div className={`txn-line txn-line--${variant}`}>
      <div className="main-line">
        {variant === 'expenseGroup' ? (
          <div className="txn-plain-copy">
            {txn.note?.trim() ? (
              <strong>{txn.note.trim()}</strong>
            ) : (
              <strong className="txn-no-note">{t('transactions.noNote')}</strong>
            )}
            <span>{getFormattedDate(txn.date)}</span>
          </div>
        ) : (
          <ExpenseGroupName expenseGroup={expenseGroup} note={txn.note} notePrimary />
        )}
        <div className="amount">-{fmtMoney(txn.amount)}</div>
      </div>
    </div>
  );
};

export default TransactionLine;
