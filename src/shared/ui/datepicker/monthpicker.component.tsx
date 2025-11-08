import React from 'react';
import { DayPicker } from 'react-day-picker';
import clsx from 'clsx';
import 'react-day-picker/style.css';

import { formatPeriodLabel, periodBounds } from '@shared/utils';
import { DEFAULT_START_DAY } from '@api/models';
import { useDismissOnOutside } from '@shared/hooks';

import './datepicker.styles.scss';

type MonthPickerProps = {
  label?: string;
  value: Date | null;
  onMonthPick: (date: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  error?: string;
  className?: string;
  startDay?: number;
};

const MonthPicker: React.FC<MonthPickerProps> = ({
  label,
  value,
  onMonthPick,
  placeholder = 'Select month',
  disabled,
  minDate,
  maxDate,
  error,
  className,
  startDay = DEFAULT_START_DAY,
}) => {
  const [open, setOpen] = React.useState(false);

  const containerRef = useDismissOnOutside<HTMLDivElement>(open, () => setOpen(false));

  const containerClass = clsx('date-field', className);
  const buttonClass = clsx('date-field__control', 'monthpicker__control', {
    'has-error': error,
  });

  return (
    <div ref={containerRef} className={containerClass}>
      {label && <label className="date-field__label">{label}</label>}

      <button
        type="button"
        className={buttonClass}
        onClick={() => setOpen((o) => !o)}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span>
          {value ? (
            (() => {
              const { start, end } = periodBounds(value, startDay);
              return formatPeriodLabel(start, end, { endIsExclusive: true });
            })()
          ) : (
            <span className="placeholder">{placeholder}</span>
          )}
        </span>
        <span className="chevron" aria-hidden>
          ▾
        </span>
      </button>

      {open && (
        <div
          className="date-field__popover monthpicker__popover"
          role="dialog"
          aria-label={label ?? 'Choose month'}
        >
          <DayPicker
            mode="single"
            month={value ?? new Date()}
            onMonthChange={(month) => {
              onMonthPick(month);
              setOpen(false);
            }}
            captionLayout="dropdown"
            fromMonth={minDate}
            toMonth={maxDate}
            // hide the grid of days
            showOutsideDays={false}
            styles={{
              day: { display: 'none' },
            }}
          />
        </div>
      )}

      {error && <div className="date-field__error">{error}</div>}
    </div>
  );
};

export default MonthPicker;
