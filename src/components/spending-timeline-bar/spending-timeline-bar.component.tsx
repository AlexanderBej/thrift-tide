import React from 'react';
import { useTranslation } from 'react-i18next';
import { enUS } from 'date-fns/locale';
import clsx from 'clsx';

import { fmtToDEM, LOCALE_MAP, makeFormatter } from '@shared/utils';

import './spending-timeline-bar.styles.scss';

interface SpendingTimelineBarProps {
  periodStart: Date;
  periodEnd: Date;
  runOutDate: Date | null;
  now?: Date;
  isInForecast?: boolean;
}

const SpendingTimelineBar: React.FC<SpendingTimelineBarProps> = ({
  periodStart,
  periodEnd,
  runOutDate,
  now = new Date(),
  isInForecast = false,
}) => {
  const { i18n } = useTranslation();

  const total = +periodEnd - +periodStart;
  const elapsed = Math.max(0, Math.min(total, +now - +periodStart));
  const runout = runOutDate ? Math.min(total, +runOutDate - +periodStart) : null;

  const elapsedPct = (elapsed / total) * 100;
  const runoutPct = runout != null ? (runout / total) * 100 : null;

  const getTranslatedFmtDate = (d: Date) => {
    const locale = LOCALE_MAP[i18n.language] ?? enUS;

    const fmt = makeFormatter(true, locale);
    return fmt.format(d);
  };

  const getSpanClassNames = (edge: 'start' | 'end') => {
    return clsx('period', `period__${edge}`, {
      forecast: isInForecast,
    });
  };

  return (
    <div className="timeline-container" style={{ marginTop: isInForecast ? 10 : 50 }}>
      <div className="timeline-bar">
        <div className="track" />
        <div className="elapsed" style={{ width: `${elapsedPct}%` }} />
        {runoutPct != null && (
          <div className="marker" style={{ left: `${runoutPct}%` }} title="Projected run-out" />
        )}
      </div>
      {runOutDate && !isInForecast && fmtToDEM(runOutDate) !== fmtToDEM(periodEnd) && (
        <span className="period period__run-out" style={{ left: `${runoutPct}%` }}>
          {getTranslatedFmtDate(runOutDate)}
        </span>
      )}
      <span className={getSpanClassNames('start')}>{getTranslatedFmtDate(periodStart)}</span>
      <span className={getSpanClassNames('end')}>{getTranslatedFmtDate(periodEnd)}</span>
    </div>
  );
};

export default SpendingTimelineBar;
