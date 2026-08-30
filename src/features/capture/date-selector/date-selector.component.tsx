import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  addDays,
  format,
  isAfter,
  isBefore,
  isSameMonth,
  startOfDay,
  startOfMonth,
} from 'date-fns';
import type { Locale } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

import { Button } from '@shared/ui';

import 'react-day-picker/dist/style.css';
import './date-selector.styles.scss';

interface CaptureDateBounds {
  min: Date;
  max: Date;
  hasValidDate: boolean;
}

interface DateSelectorProps {
  value: Date | null;
  bounds: CaptureDateBounds | null;
  locale: Locale;
  onSelect: (date: Date) => void;
}

const isDateAllowed = (date: Date | null, bounds: CaptureDateBounds | null) => {
  if (!date || !bounds?.hasValidDate) return false;
  const day = startOfDay(date);
  return !isBefore(day, bounds.min) && !isAfter(day, bounds.max);
};

const DateSelector: React.FC<DateSelectorProps> = ({ value, bounds, locale, onSelect }) => {
  const { t } = useTranslation(['budget', 'common']);
  const tt = (key: string, options?: any) => t(key, options) as unknown as string;
  const [displayMonth, setDisplayMonth] = useState(() =>
    startOfMonth(value ?? bounds?.min ?? new Date()),
  );

  useEffect(() => {
    setDisplayMonth(startOfMonth(value ?? bounds?.min ?? new Date()));
  }, [bounds?.min, value]);

  if (!bounds?.hasValidDate) {
    return (
      <section className="capture-body capture-selector-view">
        <p className="capture-inline-error">{t('budget:capture.noValidDate')}</p>
      </section>
    );
  }

  const yesterday = addDays(new Date(), -1);
  const todayAllowed = isDateAllowed(new Date(), bounds);
  const yesterdayAllowed = isDateAllowed(yesterday, bounds);
  const canGoPrev = !isSameMonth(displayMonth, bounds.min) && displayMonth > bounds.min;
  const canGoNext = !isSameMonth(displayMonth, bounds.max) && displayMonth < bounds.max;

  return (
    <section className="capture-body capture-selector-view">
      <div className="capture-date-shortcuts">
        {todayAllowed && (
          <Button variant="secondary" onClick={() => onSelect(new Date())}>
            {t('common:dates.today')}
          </Button>
        )}
        {yesterdayAllowed && (
          <Button variant="secondary" onClick={() => onSelect(yesterday)}>
            {t('common:dates.yesterday')}
          </Button>
        )}
      </div>

      <div className="capture-calendar-nav">
        <Button
          variant="quiet"
          icon={FaChevronLeft}
          iconOnly
          ariaLabel={tt('budget:capture.previousMonth')}
          disabled={!canGoPrev}
          onClick={() => setDisplayMonth(startOfMonth(addDays(displayMonth, -1)))}
        />
        <h2>{format(displayMonth, 'MMMM yyyy', { locale })}</h2>
        <Button
          variant="quiet"
          icon={FaChevronRight}
          iconOnly
          ariaLabel={tt('budget:capture.nextMonth')}
          disabled={!canGoNext}
          onClick={() => setDisplayMonth(startOfMonth(addDays(displayMonth, 32)))}
        />
      </div>

      <DayPicker
        mode="single"
        selected={value ?? undefined}
        month={displayMonth}
        onMonthChange={setDisplayMonth}
        onSelect={(date) => date && onSelect(date)}
        weekStartsOn={1}
        fixedWeeks
        showOutsideDays
        hideNavigation
        locale={locale}
        disabled={[{ before: bounds.min }, { after: bounds.max }]}
        className="capture-calendar"
      />
    </section>
  );
};

export default DateSelector;
