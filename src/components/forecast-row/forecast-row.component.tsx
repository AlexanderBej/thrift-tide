import React from 'react';

import { SpendingTimelineBar } from '../spending-timeline-bar/spending-timeline-bar.component';
import { fmtDate } from '../../utils/format-data.util';
import TTIcon from '../../components-ui/icon/icon.component';

import './forecast-row.styles.scss';
import { BUCKET_COLORS, BUCKET_ICONS, BucketType } from '../../api/types/bucket.types';

interface ForecastRowProps {
  periodStart: Date;
  periodEnd: Date;
  runOutDate: Date | null;
  daysToZero: number | null;
  bucket: string;
}

const ForecastRow: React.FC<ForecastRowProps> = ({
  periodEnd,
  periodStart,
  runOutDate,
  daysToZero,
  bucket,
}) => {
  const icon =
    bucket === 'Needs'
      ? BUCKET_ICONS.needs
      : bucket === 'Wants'
        ? BUCKET_ICONS.wants
        : BUCKET_ICONS.savings;

  return (
    <div className="forecast-row">
      <div className="forecast-date-row">
        <div className="forecast-date-label">
          <div
            className="forecast-icon-wrapper"
            style={{ backgroundColor: BUCKET_COLORS[bucket.toLowerCase() as BucketType] }}
          >
            <TTIcon icon={icon} size={22} color="white" />
          </div>
          <span className="label-text">{bucket}</span>
        </div>
        <div className="forecast-date-value">
          <strong>{fmtDate(runOutDate ?? periodEnd)}</strong>{' '}
          <span className="forecast-date-dayz">
            (<strong>{daysToZero ?? 0}</strong> days to 0)
          </span>
        </div>
      </div>
      <SpendingTimelineBar
        isInForecast={true}
        periodStart={periodStart}
        periodEnd={periodEnd}
        runOutDate={runOutDate}
      />
    </div>
  );
};

export default ForecastRow;
