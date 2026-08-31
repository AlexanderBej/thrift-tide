import React from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { InfoPopover } from '@shared/ui';

import './apply-editor.styles.scss';

interface ApplyEditorProps {
  hasModified: boolean;
  applyToCurrentMonth: boolean;
  setApplyToCurrentMonth: (applyToCurrentMonth: boolean) => void;
  hidePopover?: boolean;
  disabled?: boolean;
}

const ApplyEditor: React.FC<ApplyEditorProps> = ({
  hasModified,
  applyToCurrentMonth,
  setApplyToCurrentMonth,
  hidePopover = false,
  disabled,
}) => {
  const { t } = useTranslation('common');
  const isDisabled = disabled ?? !hasModified;

  return (
    <div className={clsx('apply-row', { 'row-disabled': isDisabled })}>
      <div className="apply-label">
        {!hidePopover && (
          <InfoPopover position={'right'}>
            <span>{t('settings:percents.popover')}</span>
          </InfoPopover>
        )}
        <span>{t('settings:percents.checkbox.title')}</span>
      </div>

      <div className="apply-options">
        <button
          type="button"
          className={clsx('option-btn', {
            selected: applyToCurrentMonth,
            disabled: isDisabled,
          })}
          aria-pressed={applyToCurrentMonth}
          disabled={isDisabled}
          onClick={() => setApplyToCurrentMonth(true)}
        >
          {t('settings:percents.checkbox.labelNow')}
        </button>
        <button
          type="button"
          className={clsx('option-btn', {
            selected: !applyToCurrentMonth,
            disabled: isDisabled,
          })}
          aria-pressed={!applyToCurrentMonth}
          disabled={isDisabled}
          onClick={() => setApplyToCurrentMonth(false)}
        >
          {t('settings:percents.checkbox.labelFuture')}
        </button>
      </div>
    </div>
  );
};

export default ApplyEditor;
