import React from 'react';
import { useTranslation } from 'react-i18next';
import { enUS } from 'date-fns/locale';

import { fmtToDEM, LOCALE_MAP, makeFormatter } from '../../utils/format-data.util';

import './spending-timeline-bar.styles.scss';

interface SpendingTimelineBarProps {
  periodStart: Date;
  periodEnd: Date;
  runOutDate: Date | null;
  now?: Date;
  isInForecast?: boolean;
}

export const SpendingTimelineBar: React.FC<SpendingTimelineBarProps> = ({
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
      <span className={`period period__start period__${isInForecast ? 'forecast' : ''}`}>
        {getTranslatedFmtDate(periodStart)}
      </span>
      <span className={`period period__end period__${isInForecast ? 'forecast' : ''}`}>
        {getTranslatedFmtDate(periodEnd)}
      </span>
    </div>
  );
};
