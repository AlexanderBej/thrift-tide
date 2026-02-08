import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  addDays,
  endOfMonth,
  format,
  startOfMonth,
  isWithinInterval,
  startOfDay,
  isSameDay,
} from 'date-fns';
import { DayPicker } from 'react-day-picker';
import { ro, enUS } from 'date-fns/locale';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

import { selectMonthTiming } from '@store/budget-store';
import { TTIcon } from '@shared/ui';
import { getCssVar } from '@shared/utils';

import 'react-day-picker/dist/style.css';
import './txn-day-picker.styles.scss';

interface TxnDayPickerProps {
  value: Date | null;
  onChange: (next: Date) => void;
  setStep: React.Dispatch<React.SetStateAction<'form' | 'calendar'>>;
  // Optional: for locale
  lang?: 'en' | 'ro';
}

const monthStart = (d: Date) => startOfMonth(d);
const monthEnd = (d: Date) => endOfMonth(d);

const TxnDayPicker: React.FC<TxnDayPickerProps> = ({ value, onChange, setStep, lang = 'en' }) => {
  const { periodStart, periodEnd } = useSelector(selectMonthTiming);

  // End is exclusive in your app: [start, end)
  // const maxDate = useMemo(() => addDays(periodEnd, -1), [periodEnd]);
  const maxDate = addDays(periodEnd, -1); // end exclusive in your app

  // period can span 1 or 2 months; we clamp nav to these months
  const firstMonth = useMemo(() => monthStart(periodStart), [periodStart]);
  const lastMonth = useMemo(() => monthStart(maxDate), [maxDate]);

  const locale = lang === 'ro' ? ro : enUS;

  const inAllowedRange = (d: Date) =>
    isWithinInterval(d, { start: startOfDay(periodStart), end: startOfDay(maxDate) });

  // Displayed month (controlled)
  const [displayMonth, setDisplayMonth] = useState<Date>(() => {
    // default month: selected date if in range, else periodStart month
    const base = value ?? periodStart;
    return monthStart(base);
  });

  const disabled = useMemo(
    () => [{ before: periodStart }, { after: maxDate }],
    [periodStart, maxDate],
  );

  const canGoPrev = displayMonth > firstMonth;
  const canGoNext = displayMonth < lastMonth;

  const headerLabel = format(displayMonth, 'MMMM yyyy', { locale });

  return (
    <div className="txn-day-picker">
      <div className="step-back-btn-wrapper">
        <button onClick={() => setStep('form')}>
          <TTIcon icon={FaChevronLeft} size={14} color={getCssVar('--color-secondary')} />
          <span className="step-back-btn-label">Back to expense</span>
        </button>
      </div>
      <div className="day-picker-nav">
        <button
          type="button"
          onClick={() => canGoPrev && setDisplayMonth(monthStart(addDays(displayMonth, -1)))}
          disabled={!canGoPrev}
          aria-label="Previous month"
          style={{ opacity: canGoPrev ? 1 : 0.4, display: 'flex' }}
        >
          <TTIcon icon={FaChevronLeft} size={18} color={getCssVar('--color-primary')} />
        </button>

        <div style={{ fontWeight: 600 }}>{headerLabel}</div>

        <button
          type="button"
          onClick={() =>
            canGoNext && setDisplayMonth(monthStart(addDays(monthEnd(displayMonth), 1)))
          }
          disabled={!canGoNext}
          aria-label="Next month"
          style={{ opacity: canGoNext ? 1 : 0.4 }}
        >
          <TTIcon icon={FaChevronRight} size={18} color={getCssVar('--color-primary')} />
        </button>
      </div>
      <div className="tt-calendar" style={{ padding: 12 }}>
        <DayPicker
          mode="single"
          selected={value ?? new Date()}
          onSelect={(d) => d && onChange(d)}
          month={displayMonth}
          onMonthChange={setDisplayMonth}
          weekStartsOn={1}
          fixedWeeks
          showOutsideDays
          hideNavigation
          // Disable outside your period bounds
          disabled={[{ before: periodStart }, { after: maxDate }]}
          // Custom modifiers for styling
          modifiers={{
            allowed: (date) =>
              isWithinInterval(date, {
                start: startOfDay(periodStart),
                end: startOfDay(maxDate),
              }),
            rangeStart: (date) => isSameDay(date, periodStart),
            rangeEnd: (date) => isSameDay(date, maxDate),

            today: (date) => isSameDay(date, new Date()),
          }}
          modifiersClassNames={{
            allowed: 'tt-allowed',
            today: 'tt-today',
            selected: 'tt-selected', // DayPicker applies `selected` automatically
            disabled: 'tt-disabled',
            outside: 'tt-outside',
            rangeStart: 'tt-range-start',
            rangeEnd: 'tt-range-end',
          }}
          classNames={{
            months: 'tt-months',
            month: 'tt-month',
            month_grid: 'tt-grid',
            weekdays: 'tt-weekdays',
            weekday: 'tt-weekday',
            weeks: 'tt-weeks',
            week: 'tt-week',
            day: 'tt-day',
            day_button: 'tt-dayBtn',
            outside: 'tt-outside',
            disabled: 'tt-disabled',
            selected: 'tt-selected',
            today: 'tt-today',
            caption: 'tt-caption', // we hide it anyway
            nav: 'tt-nav', // we hide it anyway
            range_start: 'tt-start',
            range_end: 'tt-end',
          }}
        />
      </div>
    </div>
  );
};

export default TxnDayPicker;
