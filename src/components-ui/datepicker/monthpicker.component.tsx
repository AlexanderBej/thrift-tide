import React, { useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { format } from 'date-fns';

import './datepicker.styles.scss';
import { useDismissOnOutside } from '../../utils/dismiss-on-outside.hook';
import { formatPeriodLabel, periodBounds } from '../../utils/period.util';
import { DEFAULT_START_DAY } from '../../api/models/month-doc';

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

  return (
    <div ref={containerRef} className={`date-field ${className ?? ''}`}>
      {label && <label className="date-field__label">{label}</label>}

      <button
        type="button"
        className={`date-field__control monthpicker__control ${error ? 'has-error' : ''}`}
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
