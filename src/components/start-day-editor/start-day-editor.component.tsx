import React from 'react';
import { useTranslation } from 'react-i18next';

import { FormInput } from '@shared/ui';

import './start-day-editor.styles.scss';

interface StartDayEditorProps {
  startDay: number;
  onSetStartDay: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const StartDayEditor: React.FC<StartDayEditorProps> = ({ startDay, onSetStartDay }) => {
  const { t } = useTranslation('common');

  return (
    <div className="start-day-settings">
      <span>{t('pageContent.settings.startDay.label1') ?? 'Start the period on the'}</span>
      <FormInput
        value={startDay}
        inputType="number"
        name="startDay"
        customClassName="start-day-input"
        onChange={onSetStartDay}
        min={1}
        max={28}
        numberMaxDecimals={0}
      />
      <span>{t('pageContent.settings.startDay.label2') ?? 'of the month'}</span>
    </div>
  );
};

export default StartDayEditor;
