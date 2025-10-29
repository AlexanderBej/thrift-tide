import React from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { nivoThemeBuilder } from './charts.theme';
import { formatCurrency } from '../../utils/format-data.util';

export type BarChartRow = { category: string; allocated: number; spent: number };

interface StackedBarChartProps {
  data: BarChartRow[];
  height?: number;
  fontSize?: number;
}

const StackedBarChart: React.FC<StackedBarChartProps> = ({ data, height = 260, fontSize = 12 }) => {
  const nivoTheme = nivoThemeBuilder(fontSize);

  return (
    <div style={{ height }}>
      <ResponsiveBar
        data={data}
        theme={nivoTheme}
        indexBy="category"
        keys={['allocated', 'spent']}
        groupMode="grouped"
        margin={{ top: 16, right: 16, bottom: 36, left: 48 }}
        padding={0.3}
        borderRadius={6}
        colors={
          ({ id }) => (id === 'spent' ? 'var(--wants)' : 'var(--needs)') // quick example
        }
        axisBottom={{ tickRotation: 0 }}
        axisLeft={{ format: (v) => `$${Number(v).toLocaleString()}` }}
        labelSkipWidth={28}
        labelSkipHeight={20}
        labelTextColor="#fff"
        tooltip={({ id, value, indexValue }) => (
          <div>
            <strong>{indexValue}</strong> — {String(id)}: {formatCurrency(Number(value))}
          </div>
        )}
      />
    </div>
  );
};

export default StackedBarChart;
