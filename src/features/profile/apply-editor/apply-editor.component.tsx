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
}

const ApplyEditor: React.FC<ApplyEditorProps> = ({
  hasModified,
  applyToCurrentMonth,
  setApplyToCurrentMonth,
  hidePopover = false,
}) => {
  const { t } = useTranslation('common');

  return (
    <div className={clsx('apply-row', { 'row-disabled': !hasModified })}>
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
            disabled: !hasModified,
          })}
          onClick={() => setApplyToCurrentMonth(true)}
        >
          {t('settings:percents.checkbox.labelNow')}
        </button>
        <button
          type="button"
          className={clsx('option-btn', {
            selected: !applyToCurrentMonth,
            disabled: !hasModified,
          })}
          onClick={() => setApplyToCurrentMonth(false)}
        >
          {t('settings:percents.checkbox.labelFuture')}
        </button>
      </div>
    </div>
  );
};

export default ApplyEditor;
