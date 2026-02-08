import React from 'react';
import { useTranslation } from 'react-i18next';
import { enUS } from 'date-fns/locale';

import { LOCALE_MAP, makeFormatter, toYMD } from '@shared/utils';
import { Txn, ExpenseGroupOption } from '@api/models';
import { useWindowWidth } from '@shared/hooks';
import { useFormatMoney } from '@shared/hooks';
import { ExpansionRow } from '@shared/ui';
import { ExpenseGroupName } from 'components/expense-group-name';

import './transaction-row.styles.scss';

interface TransactionRowProps {
  txn: Txn;
  source: 'expenseGroup' | 'transaction';
  expGroup?: ExpenseGroupOption;
}

const TransactionRow: React.FC<TransactionRowProps> = ({ txn, source, expGroup }) => {
  const { t, i18n } = useTranslation(['common', 'budget']);
  const fmt = useFormatMoney();

  const width = useWindowWidth();
  const isMobile = width < 480;

  const getFormattedDate = (date: any) => {
    const dateObj = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (toYMD(dateObj) === toYMD(today)) return t('dates.today') ?? 'Today';
    if (toYMD(dateObj) === toYMD(yesterday)) return t('dates.yesterday') ?? 'Yesterday';

    const locale = LOCALE_MAP[i18n.language] ?? enUS;

    const fmt = makeFormatter(locale);
    return fmt.format(dateObj);
  };

  const toCamelCase = (word: string): string => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  };

  if (!txn || !expGroup) return null;

  if (source === 'expenseGroup') {
    return (
      <ExpansionRow
        buttonClassName="transaction-row"
        canToggle={isMobile ? true : false}
        expandedContent={
          <div style={{ opacity: 0.7, fontSize: 14, marginLeft: 62 }}>
            <strong>Note: </strong>
            {txn.note ?? ''}
          </div>
        }
      >
        <div className="txn-line-date">{getFormattedDate(txn.date)}</div>
        <ExpenseGroupName expenseGroup={expGroup} />
        <div style={{ opacity: 0.7, display: isMobile ? 'none' : 'block' }}>{txn.note ?? ''}</div>
        <div style={{ marginLeft: 'auto', fontWeight: 600 }}>{fmt(txn.amount)}</div>
      </ExpansionRow>
    );
  } else
    return (
      <ExpansionRow
        buttonClassName="txn-row"
        canToggle={isMobile ? true : false}
        expandedContent={
          <div style={{ opacity: 0.7, fontSize: 14 }}>
            <strong>Note: </strong>
            {txn.note ?? ''}
          </div>
        }
      >
        <div className="txn-eg-row">
          <ExpenseGroupName expenseGroup={expGroup} />
          <span className={`eg-type-badge eg-type-badge__${txn.type}`}>
            {t(`taxonomy:categoryNames.${txn.type}`) ?? toCamelCase(txn.type)}
          </span>
        </div>
        <span className="note" style={{ display: isMobile ? 'none' : 'block' }}>
          {txn.note}
        </span>
        <div className="amount">-{fmt(txn.amount)}</div>
      </ExpansionRow>
    );
};

export default TransactionRow;
