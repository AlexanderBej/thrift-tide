import React from 'react';

import { fmtToDEM } from '../../utils/format-data.util';

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
  const total = +periodEnd - +periodStart;
  const elapsed = Math.max(0, Math.min(total, +now - +periodStart));
  const runout = runOutDate ? Math.min(total, +runOutDate - +periodStart) : null;

  const elapsedPct = (elapsed / total) * 100;
  const runoutPct = runout != null ? (runout / total) * 100 : null;

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
          {fmtToDEM(runOutDate)}
        </span>
      )}
      <span className={`period period__start period__${isInForecast ? 'forecast' : ''}`}>
        {fmtToDEM(periodStart)}
      </span>
      <span className={`period period__end period__${isInForecast ? 'forecast' : ''}`}>
        {fmtToDEM(periodEnd)}
      </span>
    </div>
  );
};
