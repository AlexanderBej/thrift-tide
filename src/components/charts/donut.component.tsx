import React from 'react';
import { ComputedDatum, ResponsivePie } from '@nivo/pie';
import { nivoTheme } from './charts.theme';
// import { formatCurrency } from '../../utils/format-currency.util';
import PieOverlay from './donut-overlay.component';

export type Item = {
  id: string;
  label: string;
  allocated: number; // total allocated sum (drives slice angle)
  used: number; // how much was used from allocated
  color?: string; // base color (we’ll render this lighter for the base)
  strongColor?: string; // optional stronger color for the overlay; falls back to color
};

export type RawDatum = {
  id: string;
  value: number; // allocated
  label?: string;
  color?: string;
  raw: Item; // keep original for overlay/tooltip
};

interface DonutChartProps {
  data: Item[];
  height?: number;
  innerRatio?: number; // donut thickness
  overlayPadding?: number; // px of gap between overlay and outer edge of the donut
}

const DonutChart: React.FC<DonutChartProps> = ({
  data,
  height = 260,
  innerRatio = 0.68,
  overlayPadding = 2,
}) => {
  // Convert to Nivo data (value = allocated)
  const pieData: RawDatum[] = data.map((d) => ({
    id: d.id || d.label,
    label: d.label,
    value: d.allocated,
    color: d.color,
    raw: d,
  }));

  return (
    <div style={{ height }}>
      <ResponsivePie<RawDatum>
        data={pieData}
        theme={nivoTheme}
        innerRadius={innerRatio}
        padAngle={2}
        cornerRadius={8}
        activeOuterRadiusOffset={6}
        enableArcLabels={false}
        // Light base color for each slice (allocated)
        colors={{ datum: 'data.color' }}
        margin={{ top: 8, right: 8, bottom: 28, left: 8 }}
        arcLinkLabelsSkipAngle={360}
        layers={['arcs', PieOverlay, 'arcLabels', 'arcLinkLabels', 'legends']}
        tooltip={({ datum }: { datum: ComputedDatum<RawDatum> }) => {
          const item = datum.data.raw;
          // const usedPct = item.allocated > 0 ? (item.used / item.allocated) * 100 : 0;
          return (
            <div style={{ padding: 8 }}>
              <div>
                <strong>{item.label}</strong>
              </div>
              {/* <div>Allocated: {formatCurrency(item.allocated)}</div>
              <div>
                Used: {formatCurrency(item.used)} ({usedPct.toFixed(0)}%)
              </div> */}
            </div>
          );
        }}
      />
    </div>
  );
};

export default DonutChart;
