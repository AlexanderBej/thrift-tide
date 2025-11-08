import React from 'react';
import { DayPicker } from 'react-day-picker';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { enUS } from 'date-fns/locale';
import 'react-day-picker/style.css';

import { useDismissOnOutside } from '@shared/hooks';
import { LOCALE_MAP, makeFormatter } from '@shared/utils';

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

  const containerRef = useDismissOnOutside<HTMLDivElement>(open, () => setOpen(false));

  const { i18n } = useTranslation();

  const getTranslatedFmtDate = (d: Date) => {
    const locale = LOCALE_MAP[i18n.language] ?? enUS;

    const fmt = makeFormatter(false, locale, true);
    return fmt.format(d);
  };

  const containerClass = clsx('date-field', className);
  const buttonClass = clsx('date-field__control', {
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
        {value ? getTranslatedFmtDate(value) : <span className="placeholder">{placeholder}</span>}
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
