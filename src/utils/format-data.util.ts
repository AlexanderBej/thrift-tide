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

export function toMillisSafe(input: any): number {
  if (!input) return 0;
  if (typeof input.toMillis === 'function') return input.toMillis(); // Firestore Timestamp
  if (input instanceof Date) return input.getTime();
  if (typeof input === 'string') return Date.parse(input);
  if (typeof input === 'number') return input;
  return 0;
}

/** Convert Date/string/number to canonical UTC 'YYYY-MM-DD'. */
export function toYMDUTC(input: Date | string | number): string {
  const d =
    input instanceof Date ? input : typeof input === 'string' ? new Date(input) : new Date(input);
  // force UTC to avoid TZ shifts
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const LOCALE_MAP: Record<string, string> = {
  en: 'en-US',
  ro: 'ro-RO',
};

export function makeFormatter(isMobile: boolean, locale: string, withYear?: boolean) {
  if (withYear) {
    return new Intl.DateTimeFormat(locale, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  return new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    month: isMobile ? 'short' : 'long',
    day: 'numeric',
  });
}
