import React from 'react';

import { SortKey } from '@store/budget-store';
import { BaseSheet } from '@shared/ui';
import { useTranslation } from 'react-i18next';

import './sort-sheet.styles.scss';
import clsx from 'clsx';

interface SortSheetProps {
  open: boolean;
  onOpenChange: (open: boolean, sortKey: SortKey) => void;
  sortCriteria: SortKey;
}

const SortSheet: React.FC<SortSheetProps> = ({ open, onOpenChange, sortCriteria }) => {
  const { t } = useTranslation('budget');

  const close = () => onOpenChange(false, sortCriteria);

  const selectCriteria = (sort: SortKey) => {
    onOpenChange(false, sort);
  };

  const SORT_OPTIONS: { value: SortKey; label: string }[] = [
    { value: 'date', label: t('sheets.sortSheet.sortOption.date') },
    { value: 'amount', label: t('sheets.sortSheet.sortOption.amount') },
    { value: 'expenseGroup', label: t('sheets.sortSheet.sortOption.expenseGroup') },
  ];

  return (
    <BaseSheet
      open={open}
      onOpenChange={(isOpen) => (isOpen ? undefined : close())}
      title="Sort transactions"
    >
      <div className="sort-sheet">
        {SORT_OPTIONS.map((sort, index) => {
          return (
            <button
              type="button"
              key={index}
              className={clsx('sort-bubble', {
                selected: sort.value === sortCriteria,
              })}
              onClick={() => selectCriteria(sort.value)}
            >
              <span className="sort-value">{sort.label}</span>
            </button>
          );
        })}
      </div>
    </BaseSheet>
  );
};

export default SortSheet;
