import React from 'react';
import { format } from 'date-fns';

import { fmt, toYMD } from '../../utils/format-data.util';
import { Txn } from '../../api/models/txn';
import { CategoryOption } from '../../api/models/category-option';
import { BUCKET_LIGHT_COLORS } from '../../api/types/bucket.types';
import CategoryName from '../category-name/category-name.component';

import './transaction-row.styles.scss';

interface TransactionRowProps {
  txn: Txn;
  source: 'category' | 'transaction';
  category?: CategoryOption;
}

const TransactionRow: React.FC<TransactionRowProps> = ({ txn, source, category }) => {
  const getFormattedDate = (date: any) => {
    const dateObj = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (toYMD(dateObj) === toYMD(today)) return 'Today';
    if (toYMD(dateObj) === toYMD(yesterday)) return 'Yesterday';

    const formattedDate = format(new Date(date), 'EE, MMMM do');
    return formattedDate;
  };

  const toCamelCase = (word: string): string => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  };

  if (!txn || !category) return null;

  if (source === 'category') {
    return (
      <div className="transaction-line">
        <div>{getFormattedDate(txn.date)}</div>
        <CategoryName category={category} />
        <div style={{ opacity: 0.7 }}>{txn.note ?? ''}</div>
        <div style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(txn.amount)}</div>
      </div>
    );
  } else
    return (
      <li className="txn-line">
        <div className="txn-cat-row">
          <CategoryName category={category} />
          <span style={{ background: BUCKET_LIGHT_COLORS[txn.type] }} className="cat-type-badge">
            {toCamelCase(txn.type)}
          </span>
        </div>
        <span className="note">{txn.note}</span>
        <div className="amount">-{fmt(txn.amount)}</div>
      </li>
    );
};

export default TransactionRow;
