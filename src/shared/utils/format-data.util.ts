import { Language } from '@api/types';
import { format } from 'date-fns';

// format currency for charts
export const formatCurrency = (n: number) =>
  n.toLocaleString(undefined, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

// format date to <2025-10-21>
export const toYMD = (d: Date) => format(d, 'yyyy-MM-dd');

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

export function makeFormatter(
  locale: string,
  withYear?: boolean,
  weekDay: 'short' | 'long' = 'short',
) {
  if (withYear) {
    return new Intl.DateTimeFormat(locale, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  return new Intl.DateTimeFormat(locale, {
    weekday: weekDay,
    month: 'short',
    day: 'numeric',
  });
}

export function formatMonth(yyyyMm: string, lang?: Language) {
  const [year, month] = yyyyMm.split('-');
  const date = new Date(Number(year), Number(month) - 1);

  return date.toLocaleString(lang === 'ro' ? 'ro-RO' : 'en-US', { month: 'long' });
}

export const formatStartDay = (day: number | undefined, lang?: Language) => {
  if (!day) return;
  if (lang === 'ro') return day;
  switch (day) {
    case 1:
    case 21:
      return `${day}st`;

    case 2:
    case 22:
      return `${day}nd`;

    case 3:
    case 23:
      return `${day}rd`;

    default:
      return `${day}th`;
  }
};
