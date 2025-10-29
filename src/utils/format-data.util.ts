import { format } from 'date-fns';

// format currency for charts
export const formatCurrency = (n: number) =>
  n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

// format date to <2025-10-21>
export const toYMD = (d: Date) => format(d, 'yyyy-MM-dd');

// format price to 2 digits and add currency symbol
export const fmt = (n: number | null | undefined, currency = '€') =>
  n == null ? '—' : `${currency}${n.toFixed(2)}`;

// format date to <21 Oct 2025>
export const fmtDate = (d: Date) => {
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
};

// format date to <Sat, 21 October>
export const toEMD = (d: Date) => {
  return format(d, 'EE, MMMM do');
};

// format date to <Sat, 21 Oct>
export const fmtToDEM = (d: Date) => {
  return format(d, 'EE, do MMM');
};
