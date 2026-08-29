import React from 'react';
import { FiAlertTriangle, FiTrash2 } from 'react-icons/fi';

import { BaseSheet } from '@shared/ui/base-sheet';
import { TTIcon } from '@shared/ui/icon';
import { V3Action } from '@shared/ui/v3-action';

import './confirm-sheet.styles.scss';

type ConfirmTone = 'default' | 'destructive' | 'discard';

interface ConfirmSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  tone?: ConfirmTone;
  loading?: boolean;
}

const ConfirmSheet: React.FC<ConfirmSheetProps> = ({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmLabel,
  cancelLabel,
  onCancel,
  tone = 'default',
  loading = false,
}) => {
  const [pending, setPending] = React.useState(false);
  const isLoading = loading || pending;
  const isDestructive = tone === 'destructive' || tone === 'discard';
  const ConfirmIcon =
    tone === 'destructive' ? FiTrash2 : tone === 'discard' ? FiAlertTriangle : null;

  const handleCancel = () => {
    if (isLoading) return;
    onCancel?.();
    onOpenChange(false);
  };

  const handleConfirm = async () => {
    if (isLoading) return;

    setPending(true);
    try {
      await onConfirm();
    } finally {
      setPending(false);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (isLoading && !nextOpen) return;
    onOpenChange(nextOpen);
  };

  return (
    <BaseSheet
      open={open}
      onOpenChange={handleOpenChange}
      title={title}
      description={description}
      className="confirm-sheet-shell"
      variant="compact"
    >
      <div className="confirm-sheet" data-tone={tone}>
        {ConfirmIcon && (
          <div className="confirm-sheet__icon" aria-hidden="true">
            <TTIcon icon={ConfirmIcon} color="currentColor" size={18} />
          </div>
        )}
        <div className="confirm-sheet__actions">
          <V3Action
            variant="secondary"
            size="md"
            fullWidth
            disabled={isLoading}
            onClick={handleCancel}
          >
            {cancelLabel}
          </V3Action>
          <V3Action
            variant={isDestructive ? 'destructive' : 'primary'}
            size="md"
            fullWidth
            loading={isLoading}
            ariaLabel={isLoading ? confirmLabel : undefined}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </V3Action>
        </div>
      </div>
    </BaseSheet>
  );
};

export default ConfirmSheet;
