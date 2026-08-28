export const nivoThemeBuilder = (size: number) => {
  return {
    textColor: 'var(--color-text-primary)',
    fontSize: size,
    grid: { line: { stroke: 'var(--color-chart-grid)', strokeWidth: 1 } },
    tooltip: {
      container: {
        background: 'var(--color-bg-elevated)',
        color: 'var(--color-text-primary)',
        borderRadius: 8,
        boxShadow: 'var(--shadow-elevation-3)',
        padding: 12,
      },
    },
    axis: {
      ticks: { text: { fill: 'var(--color-text-secondary)' } },
      legend: { text: { fill: 'var(--color-text-secondary)' } },
    },
  } as const;
};
