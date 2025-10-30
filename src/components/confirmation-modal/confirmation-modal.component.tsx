import React, { useState } from 'react';
import Modal from '../../components-ui/modal/modal.component';

import Button from '../../components-ui/button/button.component';

import './confirmation-modal.styles.scss';

interface ConfirmationModalProps {
  message: string;
  buttonLabel: string;
  customButtonClass?: string;
  loading?: boolean;
  handleConfirm: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  message,
  buttonLabel,
  customButtonClass,
  loading,
  handleConfirm,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        buttonType="primary"
        htmlType="button"
        customContainerClass={`${customButtonClass} confirm-btn`}
        onClick={() => setOpen(true)}
        isLoading={loading}
      >
        <span>{buttonLabel}</span>
      </Button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Confirm">
        <div className="confirmation-modal"></div>
        <p>{message}</p>

        <Button
          buttonType="primary"
          htmlType="button"
          onClick={handleConfirm}
          customContainerClass="confirm-modal-btn"
        >
          <span>Confirm</span>
        </Button>
      </Modal>
    </>
  );
};

export default ConfirmationModal;
