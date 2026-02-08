import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFormatMoney } from '@shared/hooks';
import { CategoryName } from '@components';
import { CategoryOption, Txn } from '@api/models';

import './transaction-line.styles.scss';
import { LOCALE_MAP, makeFormatter, toYMD } from '@shared/utils';
import { enUS } from 'date-fns/locale';

interface TransactionLineProps {
  category: CategoryOption;
  txn: Txn;
  showDate?: boolean;
}

const TransactionLine: React.FC<TransactionLineProps> = ({ category, txn, showDate = false }) => {
  const { t, i18n } = useTranslation('budget');
  const fmtMoney = useFormatMoney(false);

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

  return (
    <div className="txn-line">
      <div className="main-line">
        <div className="txn-cat-row">
          {showDate && <span className="date-box">{getFormattedDate(txn.date)}</span>}
          <CategoryName category={category} note={txn.note} />
          {!showDate && (
            <span className={`cat-type-badge cat-type-badge__${txn.type}`}>
              {t(`bucketNames.${txn.type}`) ?? txn.type}
            </span>
          )}
        </div>
        <div className="amount">-{fmtMoney(txn.amount)}</div>
      </div>
    </div>
  );
};

export default TransactionLine;
