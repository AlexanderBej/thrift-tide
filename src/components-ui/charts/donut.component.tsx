import React from 'react';

import { ResponsivePie } from '@nivo/pie';
import { nivoTheme } from './charts.theme';
import { formatCurrency } from '../../utils/format-data.util';

export type DonutItem = { id: string; label: string; value: number; color?: string };

export function Donut({
  data,
  height = 260,
  innerRatio = 0.68,
  showTooltip = true,
  percentage,
}: {
  data: DonutItem[];
  height?: number;
  innerRatio?: number;
  showTooltip?: boolean;
  percentage?: { value: number; color: string };
}) {
  return (
    <div style={{ height, position: 'relative', width: height }}>
      <ResponsivePie
        data={data.map((d) => ({ ...d, id: d.id || d.label }))}
        theme={nivoTheme}
        innerRadius={innerRatio}
        padAngle={2}
        cornerRadius={8}
        activeOuterRadiusOffset={6}
        enableArcLabels={false}
        colors={{ datum: 'data.color' }}
        margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
        arcLinkLabelsSkipAngle={360}
        tooltip={({ datum }) => (
          <div>
            {showTooltip && (
              <>
                <strong>{datum.label}</strong> — {formatCurrency(datum.value as number)}
              </>
            )}
          </div>
        )}
      />
      {percentage && (
        <span
          style={{
            color: percentage.color,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontWeight: 'bold',
          }}
        >
          {percentage.value.toFixed()}%
        </span>
      )}
    </div>
  );
}
