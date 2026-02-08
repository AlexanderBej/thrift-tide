import React from 'react';

import { SortKey } from '@store/budget-store';
import { BaseSheet } from '@shared/ui';

import './sort-sheet.styles.scss';

interface SortSheetProps {
  open: boolean;
  onOpenChange: (open: boolean, sortKey: SortKey) => void;
  sortCriteria: SortKey;
}

const SortSheet: React.FC<SortSheetProps> = ({ open, onOpenChange, sortCriteria }) => {
  // const nav = useNavigate();

  // const go = (path: string) => {
  //   onOpenChange(false);
  //   // slight delay feels nicer
  //   setTimeout(() => nav(path), 120);
  // };

  const close = () => onOpenChange(false, sortCriteria);

  const selectCriteria = (sort: SortKey) => {
    onOpenChange(false, sort);
  };

  return (
    <BaseSheet
      open={open}
      onOpenChange={(isOpen) => (isOpen ? undefined : close())}
      title="Sort"
      description="Sort your transactions"
    >
      <div className="sort-values">
        <button
          onClick={() => selectCriteria('date')}
          className={sortCriteria === 'date' ? 'active' : ''}
        >
          By date
        </button>
        <button
          onClick={() => selectCriteria('amount')}
          className={sortCriteria === 'amount' ? 'active' : ''}
        >
          By amount
        </button>
      </div>
    </BaseSheet>
  );
};

export default SortSheet;
