import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { FaRegWindowClose } from 'react-icons/fa';

import './modal.styles.scss';
import TTIcon from '../icon/icon.component';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: string; // e.g. '420px' or '600px'
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, width = '420px' }) => {
  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="tt-modal__overlay" onClick={onClose}>
      <div className="tt-modal" style={{ maxWidth: width }} onClick={(e) => e.stopPropagation()}>
        {title && <div className="tt-modal__header">{title}</div>}
        <hr className="tt-modal__underline"></hr>
        <div className="tt-modal__body">{children}</div>
        <button className="tt-modal__close" onClick={onClose} aria-label="Close">
          <TTIcon icon={FaRegWindowClose} size={18} />
        </button>
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
