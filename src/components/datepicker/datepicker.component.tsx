import React from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { format } from 'date-fns';

import './datepicker.styles.scss';

type DateFieldProps = {
  label?: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  error?: string;
  className?: string;
};

const DatePicker: React.FC<DateFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Select date',
  disabled,
  minDate,
  maxDate,
  error,
  className,
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <div className={`date-field ${className ?? ''}`}>
      {label && <label className="date-field__label">{label}</label>}

      <button
        type="button"
        className={`date-field__control ${error ? 'has-error' : ''}`}
        onClick={() => setOpen((o) => !o)}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {value ? format(value, 'EE, MMMM do') : <span className="placeholder">{placeholder}</span>}
        <span className="chevron" aria-hidden>
          ▾
        </span>
      </button>

      {open && (
        <div className="date-field__popover" role="dialog" aria-label={label ?? 'Choose date'}>
          <DayPicker
            mode="single"
            selected={value ?? undefined}
            onSelect={(d) => {
              onChange(d ?? null);
              setOpen(false);
            }}
            disabled={
              [
                minDate ? { before: minDate } : undefined,
                maxDate ? { after: maxDate } : undefined,
              ].filter(Boolean) as any
            }
          />
        </div>
      )}

      {error && <div className="date-field__error">{error}</div>}
    </div>
  );
};

export default DatePicker;
