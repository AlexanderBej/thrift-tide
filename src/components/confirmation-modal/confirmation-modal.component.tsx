import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Modal from '../../components-ui/modal/modal.component';
import Button from '../../components-ui/button/button.component';

import './confirmation-modal.styles.scss';

interface ConfirmationModalProps {
  message: string;
  buttonLabel: string;
  customButtonClass?: string;
  buttonDisabled?: boolean;
  loading?: boolean;
  handleConfirm: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  message,
  buttonLabel,
  customButtonClass,
  buttonDisabled = false,
  loading,
  handleConfirm,
}) => {
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        buttonType="primary"
        htmlType="button"
        customContainerClass={`${customButtonClass} confirm-btn`}
        onClick={() => setOpen(true)}
        disabled={buttonDisabled}
      >
        <span>{buttonLabel}</span>
      </Button>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={t('confirmations.modalTitle') ?? 'Confirm'}
      >
        <div className="confirmation-modal"></div>
        <p>{message}</p>

        <Button
          buttonType="primary"
          htmlType="button"
          onClick={handleConfirm}
          isLoading={loading}
          customContainerClass="confirm-modal-btn"
        >
          <span>{t('confirmations.modalTitle') ?? 'Confirm'}</span>
        </Button>
      </Modal>
    </>
  );
};

export default ConfirmationModal;
