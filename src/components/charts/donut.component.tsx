import React from 'react';
import { ResponsivePie } from '@nivo/pie';
import { nivoTheme } from './charts.theme';
import { formatCurrency } from '../../utils/format-currency.util';

type Item = { id: string; label: string; value: number; color?: string };

interface DonutChartProps {
  data: Item[];
  height?: number;
  innerRatio?: number; // donut thickness
}

const DonutChart: React.FC<DonutChartProps> = ({ data, height = 260, innerRatio = 0.68 }) => {
  return (
    <div style={{ height }}>
      <ResponsivePie
        data={data.map((d) => ({ ...d, id: d.id || d.label }))}
        theme={nivoTheme}
        innerRadius={innerRatio}
        padAngle={2}
        cornerRadius={8}
        activeOuterRadiusOffset={6}
        enableArcLabels={false}
        colors={{ datum: 'data.color' }}
        margin={{ top: 8, right: 8, bottom: 28, left: 8 }}
        arcLinkLabelsSkipAngle={360}
        tooltip={({ datum }) => (
          <div>
            <strong>{datum.label}</strong> — {formatCurrency(datum.value as number)}
          </div>
        )}
      />
    </div>
  );
};

export default DonutChart;
