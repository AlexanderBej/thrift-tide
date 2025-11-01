import React from 'react';
import { useTranslation } from 'react-i18next';
import { enUS } from 'date-fns/locale';

import { SpendingTimelineBar } from '../spending-timeline-bar/spending-timeline-bar.component';
import { fmtDate, LOCALE_MAP, makeFormatter } from '../../utils/format-data.util';
import TTIcon from '../../components-ui/icon/icon.component';
import { BUCKET_COLORS, BUCKET_ICONS, BucketType } from '../../api/types/bucket.types';

import './forecast-row.styles.scss';

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
  const { t, i18n } = useTranslation('budget');

  const getTranslatedFmtDate = (d: Date) => {
    const locale = LOCALE_MAP[i18n.language] ?? enUS;

    const fmt = makeFormatter(true, locale, true);
    return fmt.format(d);
  };

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
          <span className="label-text">{t(`bucketNames.${bucket.toLowerCase()}`) ?? bucket}</span>
        </div>
        <div className="forecast-date-value">
          <strong>
            {getTranslatedFmtDate(runOutDate ?? periodEnd) ?? fmtDate(runOutDate ?? periodEnd)}
          </strong>{' '}
          <span className="forecast-date-dayz">
            (<strong>{daysToZero ?? 0}</strong> {t('daysToZero') ?? 'days to 0'})
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
