import { getCssVar } from '@shared/utils';

export const nivoThemeBuilder = (size: number) => {
  return {
    textColor: getCssVar('--color-text-primary'),
    fontSize: size,
    grid: { line: { stroke: getCssVar('--grid'), strokeWidth: 1 } },
    tooltip: {
      container: {
        background: getCssVar('--color-bg-card'),
        color: getCssVar('--color-text-primary'),
        borderRadius: 8,
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        padding: 12,
      },
    },
    axis: {
      ticks: { text: { fill: getCssVar('--color-text-secondary') } },
      legend: { text: { fill: getCssVar('--color-text-secondary') } },
    },
  } as const;
};
