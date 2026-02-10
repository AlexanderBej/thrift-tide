import React from 'react';

import { BaseSheet } from '@shared/ui';

import './confirm-sheet.styles.scss';

interface ConfirmSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  text: string;
  btnLabel: string;
  onConfirm: () => void;
}

const ConfirmSheet: React.FC<ConfirmSheetProps> = ({
  open,
  onOpenChange,
  title,
  text,
  onConfirm,
  btnLabel,
}) => {
  return (
    <BaseSheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      btnDisabled={false}
      btnLabel={btnLabel}
      onButtonClick={onConfirm}
    >
      <div className="confirm-sheet">
        <p>{text}</p>
      </div>
    </BaseSheet>
  );
};

export default ConfirmSheet;
