import React from 'react';
import { ResponsiveLine } from '@nivo/line';

import { getCssVar } from '@shared/utils';
import { nivoThemeBuilder } from './charts.theme';

type Props = {
  data: { id: string; data: { x: string | number; y: number }[] }[];
  height?: number;
};

const DailyDotsChart: React.FC<Props> = ({ data, height = 160 }) => {
  const theme = React.useMemo(() => nivoThemeBuilder(12), []);

  // Reduce x-axis clutter: show every 5th day label
  const tickValues = React.useMemo(() => {
    const serie = data?.[0]?.data ?? [];
    return serie
      .map((p) => String(p.x))
      .filter((x) => {
        const n = Number(x);
        return Number.isFinite(n) && (n === 1 || n % 5 === 0);
      });
  }, [data]);

  return (
    <div style={{ height }}>
      <ResponsiveLine
        data={data}
        theme={theme}
        margin={{ top: 10, right: 10, bottom: 28, left: 44 }}
        xScale={{ type: 'point' }}
        yScale={{ type: 'linear', min: 0, max: 'auto', stacked: false }}
        curve="monotoneX"
        enableGridX={false}
        gridYValues={4}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickValues,
          tickSize: 0,
          tickPadding: 8,
        }}
        axisLeft={{
          tickSize: 0,
          tickPadding: 8,
          tickValues: 4,
          format: (v) => `${v}`,
        }}
        enableArea={false}
        lineWidth={2}
        colors={[getCssVar('--needs') || getCssVar('--color-secondary')]} // or pass in
        enablePoints={true}
        pointSize={8}
        pointBorderWidth={2}
        pointBorderColor={{ from: 'serieColor' }}
        pointColor={getCssVar('--color-bg-card')}
        useMesh={true}
        tooltip={({ point }) => (
          <div style={{ display: 'grid', gap: 4 }}>
            <div style={{ fontWeight: 700 }}>Day {point.data.xFormatted}</div>
            <div style={{ opacity: 0.85 }}>
              Spent: <span style={{ fontWeight: 700 }}>{point.data.yFormatted}</span>
            </div>
          </div>
        )}
      />
    </div>
  );
};

export default DailyDotsChart;
