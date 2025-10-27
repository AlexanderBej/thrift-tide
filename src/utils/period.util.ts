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

export function monthKeyFromDate(d: Date, startDay: number) {
  const { start } = periodBounds(d, startDay);
  const yyyy = start.getFullYear();
  const mm = String(start.getMonth() + 1).padStart(2, '0');
  return `${yyyy}-${mm}`; // period id is "YYYY-MM" of the period start
}

export function representativeDateFromMonthKey(monthKey: string, startDay: number) {
  const [y, m] = monthKey.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, startDay); // a date inside that period
}

export function monthKeyAdd(monthKey: string, startDay: number, deltaMonths: number) {
  const repr = representativeDateFromMonthKey(monthKey, startDay);
  const shiftedStart = new Date(repr.getFullYear(), repr.getMonth() + deltaMonths, startDay);
  return `${shiftedStart.getFullYear()}-${String(shiftedStart.getMonth() + 1).padStart(2, '0')}`;
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
