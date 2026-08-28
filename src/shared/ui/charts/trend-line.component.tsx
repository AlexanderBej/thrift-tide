import React from 'react';
import { ResponsiveLine } from '@nivo/line';
import { useSelector } from 'react-redux';

import { nivoThemeBuilder } from './charts.theme';
import { formatCurrency } from '@shared/utils';
import { selectSettingsAppTheme } from '@store/settings-store';

type Point = { x: string | number | Date; y: number };

interface TrendLineProps {
  series: { id: string; color?: string; data: Point[] }[];
  height?: number;
  fontSize?: number;
}

const TrendLineChart: React.FC<TrendLineProps> = ({ series, height = 260, fontSize = 12 }) => {
  useSelector(selectSettingsAppTheme);
  const nivoTheme = nivoThemeBuilder(fontSize);
  const pointBorderColor = 'var(--color-bg-elevated)';

  return (
    <div style={{ height }}>
      <ResponsiveLine
        data={series}
        theme={nivoTheme}
        colors={{ datum: 'color' }}
        margin={{ top: 16, right: 16, bottom: 36, left: 48 }}
        xScale={{ type: 'point' }}
        yScale={{ type: 'linear', stacked: false }}
        curve="monotoneX"
        enablePoints={true}
        pointSize={8}
        pointBorderWidth={2}
        pointBorderColor={pointBorderColor}
        useMesh
        axisLeft={{ format: (v) => `$${Number(v).toLocaleString()}` }}
        tooltip={({ point }) => (
          <div>
            <strong>{point.seriesId}</strong> — {String(point.data.xFormatted)}:{' '}
            {formatCurrency(point.data.y as number)}
          </div>
        )}
      />
    </div>
  );
};

export default TrendLineChart;
