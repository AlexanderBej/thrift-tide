import { format } from 'date-fns';

// format currency for charts
export const formatCurrency = (n: number) =>
  n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

// format date to <2025-10-21>
export const toYMD = (d: Date) => format(d, 'yyyy-MM-dd');

// format price to 2 digits and add currency symbol
export const fmt = (n: number | null | undefined, currency = '€') =>
  n == null ? '—' : `${currency}${n.toFixed(2)}`;
