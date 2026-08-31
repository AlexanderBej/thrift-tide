import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import Picker from 'react-mobile-picker';

import { BaseSheet, InfoBlock } from '@shared/ui';
import { AppDispatch, Language } from '@api/types';
import { saveStartDayThunk, selectSettingsBudgetStartDay } from '@store/settings-store';
import { selectAuthUser } from '@store/auth-store';
import { ApplyEditor } from 'features/profile/apply-editor';
import { selectBudgetDoc } from '@store/budget-store';
import { formatStartDay } from '@shared/utils/format-data.util';

import './start-day-sheet.styles.scss';

interface StartDaySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type DayPickerValue = { day: string };

const dayOptions = Array.from({ length: 28 }, (_, index) => String(index + 1));

const StartDaySheet: React.FC<StartDaySheetProps> = ({ open, onOpenChange }) => {
  const { t, i18n } = useTranslation(['common', 'settings']);
  const dispatch = useDispatch<AppDispatch>();

  const startDay = useSelector(selectSettingsBudgetStartDay);
  const user = useSelector(selectAuthUser);
  const doc = useSelector(selectBudgetDoc);
  const currentStoredDay = doc?.startDay ?? startDay;
  const futureStoredDay = startDay;

  const [currentPeriodDay, setCurrentPeriodDay] = useState<number>(currentStoredDay);
  const [futurePeriodsDay, setFuturePeriodsDay] = useState<number>(futureStoredDay);
  const [applyToCurrentMonth, setApplyToCurrentMonth] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCurrentPeriodDay(currentStoredDay);
    setFuturePeriodsDay(futureStoredDay);
    setApplyToCurrentMonth(false);
  }, [currentStoredDay, futureStoredDay, open]);

  const selectedDay = applyToCurrentMonth ? currentPeriodDay : futurePeriodsDay;
  const selectedBaselineDay = applyToCurrentMonth ? currentStoredDay : futureStoredDay;

  const handleReset = () => {
    if (applyToCurrentMonth) {
      setCurrentPeriodDay(currentStoredDay);
      return;
    }

    setFuturePeriodsDay(futureStoredDay);
  };

  const handleSubmit = async () => {
    if (!user || submitting) return;

    setSubmitting(true);
    try {
      await dispatch(
        saveStartDayThunk({
          uid: user.uuid,
          startDay: selectedDay,
          startThisMonth: applyToCurrentMonth,
        }),
      ).unwrap();
      onOpenChange(false);
    } catch {
      // Toasts are emitted by the thunk middleware; keep the sheet open for retry.
    } finally {
      setSubmitting(false);
    }
  };

  const handlePickerChange = (next: DayPickerValue) => {
    const day = Number(next.day);
    if (day < 1 || day > 28) return;

    if (applyToCurrentMonth) {
      setCurrentPeriodDay(day);
      return;
    }

    setFuturePeriodsDay(day);
  };

  const pickerValue: DayPickerValue = { day: String(selectedDay) };
  const desc = t('settings:startDay.subtitle');
  const resetLabel = t('actions.reset');
  const btnLabel = t('settings:startDay.button');
  const hasModified = selectedBaselineDay !== selectedDay;
  const areDifferent = doc?.startDay != null && startDay !== doc.startDay;
  const selectedDayLabel = formatStartDay(selectedDay, i18n.language as Language);

  return (
    <BaseSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t('settings:startDay.title')}
      description={desc}
      btnDisabled={!hasModified || submitting}
      btnLoading={submitting}
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
                {' '}
                {t('settings:startDay.info.subtitle')}{' '}
                <strong>{formatStartDay(startDay, i18n.language as Language)}</strong>
              </span>
            </div>
          </InfoBlock>
        )}

        <div className="start-day-picker" aria-label={String(t('settings:startDay.pickerLabel'))}>
          <div className="start-day-picker__center" aria-hidden="true" />
          <Picker value={pickerValue} onChange={handlePickerChange} height={168} itemHeight={48}>
            <Picker.Column name="day">
              {dayOptions.map((day) => (
                <Picker.Item key={day} value={day}>
                  {({ selected }) => (
                    <div
                      className={
                        selected ? 'start-day-picker__item is-selected' : 'start-day-picker__item'
                      }
                    >
                      {day}
                    </div>
                  )}
                </Picker.Item>
              ))}
            </Picker.Column>
          </Picker>
        </div>

        <p className="start-day-summary">
          {selectedDayLabel} {t('pageContent.profile.eachMonth')}
        </p>

        <ApplyEditor
          hidePopover
          hasModified={hasModified}
          setApplyToCurrentMonth={setApplyToCurrentMonth}
          applyToCurrentMonth={applyToCurrentMonth}
          disabled={submitting}
        />
      </div>
    </BaseSheet>
  );
};

export default StartDaySheet;
