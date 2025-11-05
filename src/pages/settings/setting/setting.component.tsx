import React from 'react';
import { useTranslation } from 'react-i18next';

import ConfirmationModal from '../../../components/confirmation-modal/confirmation-modal.component';
import Button from '../../../components-ui/button/button.component';
import InfoPopover from '../../../components-ui/info-popover/info-popover.component';

import './setting.styles.scss';

interface SettingProps {
  title: string;
  popoverContent?: string;
  popoverPosition?: 'right' | 'top' | 'bottom' | 'left';
  children: React.ReactElement;
  containerClassName?: string;
  showConfirm?: boolean;
  confirmMessage?: string;
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
  showConfirm = true,
  confirmDisabled,
  confirmLoading,
  confirmMessage = '',
  resetDisabled,
  containerClassName,
  onConfirmClick,
  onResetClick,
}) => {
  const { t } = useTranslation('common');

  return (
    <div className={`setting-container ${containerClassName}`}>
      <div className="setting-label-row">
        <p className="setting-label">{title}</p>
        {popoverContent && (
          <InfoPopover position={popoverPosition}>
            <span>{popoverContent}</span>
          </InfoPopover>
        )}
      </div>

      <div className="setting-body">{children}</div>

      <div className="settings-action-btns">
        {showConfirm ? (
          <ConfirmationModal
            buttonLabel={t('actions.save') ?? 'Save'}
            message={confirmMessage}
            handleConfirm={onConfirmClick}
            isButtonSmall={true}
            loading={confirmLoading}
            customButtonClass="settings-btn"
            buttonDisabled={confirmDisabled}
          />
        ) : (
          <Button
            buttonType="primary"
            htmlType="button"
            onClick={onConfirmClick}
            disabled={confirmDisabled}
            isLoading={confirmLoading}
            isSmall={true}
            customContainerClass="settings-btn"
          >
            <span>{t('actions.save') ?? 'Save'}</span>
          </Button>
        )}

        <Button
          buttonType="secondary"
          htmlType="button"
          onClick={onResetClick}
          isSmall={true}
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
