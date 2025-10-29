import React from 'react';
import { format } from 'date-fns';

import { fmt, toYMD } from '../../utils/format-data.util';
import { Txn } from '../../api/models/txn';
import { CategoryOption } from '../../api/models/category-option';
import { BUCKET_LIGHT_COLORS } from '../../api/types/bucket.types';
import CategoryName from '../category-name/category-name.component';

import './transaction-row.styles.scss';
import { useWindowWidth } from '../../utils/window-width.hook';
import ExpansionRow from '../../components-ui/expansion-row/expansion-row.component';

interface TransactionRowProps {
  txn: Txn;
  source: 'category' | 'transaction';
  category?: CategoryOption;
}

const TransactionRow: React.FC<TransactionRowProps> = ({ txn, source, category }) => {
  const width = useWindowWidth();
  const isMobile = width < 480;

  const getFormattedDate = (date: any) => {
    const dateObj = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (toYMD(dateObj) === toYMD(today)) return 'Today';
    if (toYMD(dateObj) === toYMD(yesterday)) return 'Yesterday';

    const formatType = isMobile ? 'EE, MMM do' : 'EE, MMMM do';

    const formattedDate = format(new Date(date), formatType);
    return formattedDate;
  };

  const toCamelCase = (word: string): string => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  };

  if (!txn || !category) return null;

  if (source === 'category') {
    return (
      <ExpansionRow
        buttonClassName="transaction-line"
        canToggle={isMobile ? true : false}
        expandedContent={
          <div style={{ opacity: 0.7, fontSize: 14, marginLeft: 62 }}>
            <strong>Note: </strong>
            {txn.note ?? ''}
          </div>
        }
      >
        <div className="txn-line-date">{getFormattedDate(txn.date)}</div>
        <CategoryName category={category} />
        <div style={{ opacity: 0.7, display: isMobile ? 'none' : 'block' }}>{txn.note ?? ''}</div>
        <div style={{ marginLeft: 'auto', fontWeight: 600 }}>{fmt(txn.amount)}</div>
      </ExpansionRow>
    );
  } else
    return (
      <ExpansionRow
        buttonClassName="txn-line"
        canToggle={isMobile ? true : false}
        expandedContent={
          <div style={{ opacity: 0.7, fontSize: 14 }}>
            <strong>Note: </strong>
            {txn.note ?? ''}
          </div>
        }
      >
        <div className="txn-cat-row">
          <CategoryName category={category} />
          <span style={{ background: BUCKET_LIGHT_COLORS[txn.type] }} className="cat-type-badge">
            {toCamelCase(txn.type)}
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
