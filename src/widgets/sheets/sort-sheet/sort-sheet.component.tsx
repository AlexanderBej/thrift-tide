import React from 'react';
import clsx from 'clsx';
import { FiCheck } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

import type { TxnGroupBy, TxnSortKey } from '@store/budget-store';
import { BaseSheet, TTIcon } from '@shared/ui';

import './sort-sheet.styles.scss';

interface SortSheetProps {
  open: boolean;
  onOpenChange: (open: boolean, groupBy: TxnGroupBy, sortKey: TxnSortKey) => void;
  groupBy: TxnGroupBy;
  sortKey: TxnSortKey;
}

const SortSheet: React.FC<SortSheetProps> = ({ open, onOpenChange, groupBy, sortKey }) => {
  const { t } = useTranslation('budget');

  const groupOptions: Array<{ value: TxnGroupBy; label: string }> = [
    { value: 'date', label: t('transactions.organize.group.date') },
    { value: 'expenseGroup', label: t('transactions.organize.group.expenseGroup') },
  ];
  const sortOptions: Array<{ value: TxnSortKey; label: string }> = [
    { value: 'newest', label: t('transactions.organize.sort.newest') },
    { value: 'oldest', label: t('transactions.organize.sort.oldest') },
    { value: 'amountDesc', label: t('transactions.organize.sort.amountDesc') },
    { value: 'amountAsc', label: t('transactions.organize.sort.amountAsc') },
  ];

  const close = () => onOpenChange(false, groupBy, sortKey);
  const selectGroup = (value: TxnGroupBy) => onOpenChange(false, value, sortKey);
  const selectSort = (value: TxnSortKey) => onOpenChange(false, groupBy, value);

  return (
    <BaseSheet
      open={open}
      onOpenChange={(isOpen) => (isOpen ? undefined : close())}
      title={t('transactions.organize.title')}
    >
      <div className="organize-sheet">
        <section aria-labelledby="organize-group-heading">
          <h3 id="organize-group-heading">{t('transactions.organize.groupBy')}</h3>
          <div className="organize-sheet__rows">
            {groupOptions.map((option) => (
              <button
                type="button"
                key={option.value}
                className={clsx('organize-sheet__row', option.value === groupBy && 'is-selected')}
                onClick={() => selectGroup(option.value)}
                aria-pressed={option.value === groupBy}
              >
                <span>{option.label}</span>
                {option.value === groupBy && <TTIcon icon={FiCheck} color="currentColor" size={18} />}
              </button>
            ))}
          </div>
        </section>

        <section aria-labelledby="organize-sort-heading">
          <h3 id="organize-sort-heading">{t('transactions.organize.sortBy')}</h3>
          <div className="organize-sheet__rows">
            {sortOptions.map((option) => (
              <button
                type="button"
                key={option.value}
                className={clsx('organize-sheet__row', option.value === sortKey && 'is-selected')}
                onClick={() => selectSort(option.value)}
                aria-pressed={option.value === sortKey}
              >
                <span>{option.label}</span>
                {option.value === sortKey && <TTIcon icon={FiCheck} color="currentColor" size={18} />}
              </button>
            ))}
          </div>
        </section>

        <p>{t('transactions.organize.helper')}</p>
      </div>
    </BaseSheet>
  );
};

export default SortSheet;
