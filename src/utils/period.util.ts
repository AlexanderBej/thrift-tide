const MS_PER_DAY = 86_400_000;

export function periodBounds(anchorDate: Date, startDay: number) {
  const y = anchorDate.getFullYear();
  const m = anchorDate.getMonth();
  const startThis = new Date(y, m, startDay);
  const start = anchorDate < startThis ? new Date(y, m - 1, startDay) : startThis;
  const end = new Date(start.getFullYear(), start.getMonth() + 1, startDay); // exclusive
  const totalDays = Math.round((+end - +start) / MS_PER_DAY);
  return { start, end, totalDays };
}

export function monthKeyFromDate(date: Date, startDay: number) {
  const { start, end } = periodBounds(date, startDay);

  // Choose which boundary defines the display month.
  const ref = startDay > 15 ? end : start;

  // Note: `end` is exclusive, but it's still on the same month/day index we want.
  const y = ref.getFullYear();
  const m = ref.getMonth() + 1;

  return `${y}-${String(m).padStart(2, '0')}`;
}

export function representativeDateFromMonthKey(monthKey: string, startDay: number) {
  const [y, m] = monthKey.split('-').map(Number); // "YYYY-MM"
  const monthIndex = (m ?? 1) - 1;

  // Day inside the target month to bias selection:
  //  - small startDay -> pick day = startDay+1 (>= means period starts THIS month)
  //  - large startDay -> pick day = 1 ( < startDay means the period starts PREVIOUS month)
  const dayInside = startDay <= 15 ? Math.min(28, startDay + 1) : 1;

  return new Date(y, monthIndex, dayInside);
}

export function monthKeyAdd(monthKey: string, startDay: number, deltaMonths: number) {
  const repr = representativeDateFromMonthKey(monthKey, startDay);
  const shifted = new Date(repr.getFullYear(), repr.getMonth() + deltaMonths, repr.getDate());
  return monthKeyFromDate(shifted, startDay);
}

export function prevMonthKey(monthKey: string, startDay: number) {
  return monthKeyAdd(monthKey, startDay, -1);
}

export function nextMonthKey(monthKey: string, startDay: number) {
  return monthKeyAdd(monthKey, startDay, +1);
}

export function formatPeriodRange(periodStart: Date, periodEnd: Date) {
  const fmt = (d: Date) =>
    d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
  return `${fmt(periodStart)} → ${fmt(periodEnd)} (exclusive)`;
}

export function formatPeriodLabel(
  periodStart: Date,
  periodEnd: Date,
  opts?: { endIsExclusive?: boolean },
) {
  // If you prefer to show the exclusive end as-is (25 → 25), keep it.
  // If you want the *inclusive* last day, uncomment the next line.
  // const end = new Date((opts?.endIsExclusive ?? true) ? +periodEnd - 86_400_000 : +periodEnd);
  const end = periodEnd; // show as given; your UI already hints it's exclusive

  const sameYear = periodStart.getFullYear() === end.getFullYear();

  const fmtDayMon = (d: Date) =>
    d.toLocaleDateString(undefined, { day: '2-digit', month: 'short' }); // "25 Oct"
  const fmtDayMonYear = (d: Date) =>
    d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }); // "25 Nov 2025"

  // e.g. "25 Oct – 25 Nov 2025" (year once if same year)
  return sameYear
    ? `${fmtDayMon(periodStart)} – ${fmtDayMonYear(end)}`
    : `${fmtDayMonYear(periodStart)} – ${fmtDayMonYear(end)}`;
}
