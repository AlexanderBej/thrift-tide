import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import clsx from 'clsx';

import { BaseSheet, InfoBlock } from '@shared/ui';
import { AppDispatch, Language } from '@api/types';
import { saveStartDayThunk, selectSettingsBudgetStartDay } from '@store/settings-store';
import { selectAuthUser } from '@store/auth-store';
import { ApplyEditor } from 'features';
import { selectBudgetDoc } from '@store/budget-store';
import { formatStartDay } from '@shared/utils';

import './start-day-sheet.styles.scss';

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

  const days =
    i18n.language === 'ro'
      ? ['Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sâ', 'Du']
      : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const getCalendarCells = (): { cells: any[]; today: number } => {
    const days = Array.from({ length: 28 }, (_, i) => i + 1);

    const firstOfMonth = new Date();
    firstOfMonth.setDate(1);

    const jsDay = firstOfMonth.getDay(); // 0..6 (Sun..Sat)
    const mondayFirstIndex = (jsDay + 6) % 7; // 0..6 (Mon..Sun)

    const startOffset = mondayFirstIndex; // 0..6 (Mo..Su) - choose what looks nicest, or derive from current month
    const cells = Array.from({ length: startOffset })
      .map((_, i) => ({ type: 'blank', id: `b${i}`, day: -1 }))
      .concat(days.map((d) => ({ type: 'day', id: d.toString(), day: d })));
    return { cells, today: new Date().getDate() };
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

        <div className="dow">
          {days.map((d) => (
            <div key={d} className="dow__cell">
              {d}
            </div>
          ))}
        </div>

        <div className="calendar-grid" role="grid">
          {getCalendarCells().cells.map((c) =>
            c.type === 'blank' ? (
              <div key={c.id} aria-hidden className="calendar-blank" />
            ) : (
              <button
                key={c.id}
                className={clsx('calendar-day', {
                  'calendar-day__selected': c.day === selectedDay,
                  'calendar-day__today': c.day === getCalendarCells().today,
                })}
                onClick={() => setSelectedDay(c.day)}
              >
                {c.day}
              </button>
            ),
          )}
        </div>
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
