import React from 'react';
import { useTranslation } from 'react-i18next';
import { enUS } from 'date-fns/locale';
import clsx from 'clsx';

import { fmtToDEM, LOCALE_MAP, makeFormatter } from '@shared/utils';

import './spending-timeline-bar.styles.scss';
import { isAfter } from 'date-fns';

interface SpendingTimelineBarProps {
  periodStart: Date;
  periodEnd: Date;
  runOutDate: Date | null;
  now?: Date;
}

const SpendingTimelineBar: React.FC<SpendingTimelineBarProps> = ({
  periodStart,
  periodEnd,
  runOutDate,
  now = new Date(),
}) => {
  const { i18n, t } = useTranslation(['common', 'budget']);

  const total = +periodEnd - +periodStart;
  const elapsed = Math.max(0, Math.min(total, +now - +periodStart));
  const runout = runOutDate ? Math.min(total, +runOutDate - +periodStart) : null;

  const elapsedPct = (elapsed / total) * 100;
  const runoutPct = runout != null ? (runout / total) * 100 : null;

  const isInFuture = isAfter(new Date(), periodEnd);

  const getTranslatedFmtDate = (d: Date) => {
    const locale = LOCALE_MAP[i18n.language] ?? enUS;

    const fmt = makeFormatter(locale);
    return fmt.format(d);
  };

  const getSpanClassNames = (edge: 'start' | 'end') => {
    return clsx('period', `period__${edge}`);
  };

  console.log('start ', periodStart.toDateString());
  console.log('periodEnd ', periodEnd.toDateString());
  console.log('runOutDate ', runOutDate?.toDateString());
  console.log('now ', now.toDateString());
  console.log('elapsedPct ', elapsedPct);
  console.log('runoutPct ', runoutPct);
  console.log('isInFuture ', isInFuture);

  return (
    <div className="timeline-container">
      <div className="run-out-container">
        {runOutDate &&
          (fmtToDEM(runOutDate) === fmtToDEM(periodEnd) ? (
            <span className="run-out run-out__over">
              {t(isInFuture ? 'budget:periodOver' : 'budget:plentyLeft')}
            </span>
          ) : (
            <span className="run-out" style={{ left: `${runoutPct}%` }}>
              {getTranslatedFmtDate(runOutDate)}
            </span>
          ))}
      </div>
      <div className="timeline-bar">
        <div className="track" />
        <div className="elapsed" style={{ width: `${elapsedPct}%` }}>
          <span className="elapsed-text">{t('dates.today')}</span>
        </div>
        {runoutPct != null && (
          <div
            className="marker"
            style={{ left: `${runoutPct < 99 ? runoutPct : 99}%` }}
            title="Projected run-out"
          />
        )}
      </div>
      <div className="period-bounds">
        <span className={getSpanClassNames('start')}>{getTranslatedFmtDate(periodStart)}</span>
        <span className={getSpanClassNames('end')}>{getTranslatedFmtDate(periodEnd)}</span>
      </div>
    </div>
  );
};

export default SpendingTimelineBar;
