import React from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import './start-day-selector.styles.scss';

interface StartDaySelectorProps {
  selectedDay: number;
  setSelectedDay: React.Dispatch<React.SetStateAction<number>>;
}

const StartDaySelector: React.FC<StartDaySelectorProps> = ({ selectedDay, setSelectedDay }) => {
  const { i18n } = useTranslation('budget');

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

  return (
    <div className="start-day-selector">
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
    </div>
  );
};

export default StartDaySelector;
