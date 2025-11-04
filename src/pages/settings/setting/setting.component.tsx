import React from 'react';
import { useTranslation } from 'react-i18next';
import { CiCircleInfo } from 'react-icons/ci';

import ConfirmationModal from '../../../components/confirmation-modal/confirmation-modal.component';
import Button from '../../../components-ui/button/button.component';
import Popover from '../../../components-ui/popover/popover.component';
import TTIcon from '../../../components-ui/icon/icon.component';

import './setting.styles.scss';

interface SettingProps {
  title: string;
  popoverContent?: string;
  popoverPosition?: 'right' | 'top' | 'bottom' | 'left';
  children: React.ReactElement;
  containerClassName?: string;
  confirmMessage: string;
  confirmLoading: boolean;
  confirmDisabled: boolean;
  onConfirmClick: () => void;
  resetDisabled: boolean;
  onResetClick: () => void;
}

const Setting: React.FC<SettingProps> = ({
  title,
  popoverContent,
  popoverPosition = 'right',
  children,
  confirmDisabled,
  confirmLoading,
  confirmMessage,
  resetDisabled,
  containerClassName,
  onConfirmClick,
  onResetClick,
}) => {
  const { t } = useTranslation('common');

  const handleConfirm = () => {
    // setOpen(false);
    onConfirmClick();
  };

  return (
    <div className={`setting-container ${containerClassName}`}>
      <div className="setting-label-row">
        <p className="setting-label">{title}</p>
        {popoverContent && (
          <Popover toggler={<TTIcon icon={CiCircleInfo} size={18} />} position={popoverPosition}>
            <span>{popoverContent}</span>
          </Popover>
        )}
      </div>

      <div className="setting-body">{children}</div>

      <div className="settings-action-btns">
        <ConfirmationModal
          buttonLabel={t('actions.save') ?? 'Save'}
          message={confirmMessage}
          handleConfirm={onConfirmClick}
          loading={confirmLoading}
          customButtonClass="settings-btn"
          buttonDisabled={confirmDisabled}
        />
        <Button
          buttonType="secondary"
          htmlType="button"
          onClick={onResetClick}
          disabled={resetDisabled}
          customContainerClass="settings-btn"
        >
          <span>{t('actions.reset') ?? 'Reset'}</span>
        </Button>
      </div>
    </div>
  );
};

export default Setting;
