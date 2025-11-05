import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Modal from '../../components-ui/modal/modal.component';
import Button from '../../components-ui/button/button.component';

import './confirmation-modal.styles.scss';

interface ConfirmationModalProps {
  message: string;
  buttonLabel: string;
  customButtonClass?: string;
  isButtonSmall?: boolean;
  buttonDisabled?: boolean;
  loading?: boolean;
  handleConfirm: () => Promise<unknown> | unknown;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  message,
  buttonLabel,
  customButtonClass,
  buttonDisabled = false,
  loading,
  isButtonSmall = false,
  handleConfirm,
}) => {
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onConfirmClick = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await handleConfirm(); // await the thunk (via unwrap in caller)
      setOpen(false); // close only on success
    } catch (e) {
      setError(t('errors.generic') ?? 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button
        buttonType="primary"
        htmlType="button"
        customContainerClass={`${customButtonClass} confirm-btn`}
        onClick={() => setOpen(true)}
        disabled={buttonDisabled}
        isSmall={isButtonSmall}
      >
        <span>{buttonLabel}</span>
      </Button>
      <Modal
        isOpen={open}
        onClose={() => (submitting ? null : setOpen(false))}
        title={t('confirmations.modalTitle') ?? 'Confirm'}
      >
        <div className="confirmation-modal">
          <p>{message}</p>
          {error && <p className="confirm-error">{error}</p>}
        </div>

        <Button
          buttonType="primary"
          htmlType="button"
          onClick={onConfirmClick}
          isLoading={submitting || loading}
          disabled={submitting || loading}
          customContainerClass="confirm-modal-btn"
        >
          <span>{t('confirmations.modalTitle') ?? 'Confirm'}</span>
        </Button>
      </Modal>
    </>
  );
};

export default ConfirmationModal;
