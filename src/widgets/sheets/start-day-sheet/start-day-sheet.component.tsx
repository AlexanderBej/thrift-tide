import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { BaseSheet, InfoBlock } from '@shared/ui';
import { AppDispatch, Language } from '@api/types';
import { saveStartDayThunk, selectSettingsBudgetStartDay } from '@store/settings-store';
import { selectAuthUser } from '@store/auth-store';
import { ApplyEditor } from 'features';
import { selectBudgetDoc } from '@store/budget-store';
import { formatStartDay } from '@shared/utils';

import './start-day-sheet.styles.scss';
import { StartDaySelector } from '@shared/components';

interface StartDaySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const StartDaySheet: React.FC<StartDaySheetProps> = ({ open, onOpenChange }) => {
  const { t, i18n } = useTranslation(['common', 'settings']);
  const dispatch = useDispatch<AppDispatch>();

  const startDay = useSelector(selectSettingsBudgetStartDay);
  const user = useSelector(selectAuthUser);
  const doc = useSelector(selectBudgetDoc);

  const [selectedDay, setSelectedDay] = useState<number>(doc?.startDay ?? startDay);
  const [applyToCurrentMonth, setApplyToCurrentMonth] = useState(false);

  useEffect(() => {
    setSelectedDay(doc?.startDay ?? startDay);
  }, [doc?.startDay, startDay]);

  const handleReset = () => {
    setSelectedDay(startDay);
  };

  const handleSubmit = () => {
    if (!user) return;

    dispatch(
      saveStartDayThunk({
        uid: user?.uuid,
        startDay: selectedDay,
        startThisMonth: applyToCurrentMonth,
      }),
    )
      .unwrap()
      .then(() => {
        setTimeout(() => onOpenChange(false), 120);
      });
  };

  const desc = t('settings:startDay.subtitle');
  const resetLabel = t('actions.reset');
  const btnLabel = t('settings:startDay.button');

  const areDifferent = startDay !== doc?.startDay;

  return (
    <BaseSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t('settings:startDay.title')}
      description={desc}
      btnDisabled={startDay === selectedDay}
      btnLabel={btnLabel}
      onButtonClick={handleSubmit}
      secondaryButtonLabel={resetLabel}
      handleSecondaryClick={handleReset}
    >
      <div className="start-day-sheet">
        {areDifferent && (
          <InfoBlock className="sheet-info-block">
            <div>
              <span>{t('settings:startDay.info.title')}</span>
              <span>
                {t('settings:startDay.info.subtitle')}{' '}
                <strong>{formatStartDay(startDay, i18n.language as Language)}</strong>
              </span>
            </div>
          </InfoBlock>
        )}

        <StartDaySelector selectedDay={selectedDay} setSelectedDay={setSelectedDay} />

        <ApplyEditor
          hidePopover
          hasModified={startDay !== selectedDay}
          setApplyToCurrentMonth={setApplyToCurrentMonth}
          applyToCurrentMonth={applyToCurrentMonth}
        />
      </div>
    </BaseSheet>
  );
};

export default StartDaySheet;
