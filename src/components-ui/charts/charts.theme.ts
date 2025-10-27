import { getCssVar } from '../../utils/style-variable.util';

export const nivoTheme = {
  textColor: getCssVar('--text-primary'),
  fontSize: 12,
  grid: { line: { stroke: getCssVar('--grid'), strokeWidth: 1 } },
  tooltip: {
    container: {
      background: getCssVar('--card-bg'),
      color: getCssVar('--text-primary'),
      borderRadius: 8,
      boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
      padding: 12,
    },
  },
  axis: {
    ticks: { text: { fill: getCssVar('--text-secondary') } },
    legend: { text: { fill: getCssVar('--text-secondary') } },
  },
} as const;
