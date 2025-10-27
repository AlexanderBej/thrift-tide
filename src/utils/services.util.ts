import { MonthDoc } from '../api/models/month-doc';
import { PercentTriple } from '../api/types/percent.types';

export const makeAllocations = (income: number, p: PercentTriple) => ({
  needs: Math.round(income * p.needs * 100) / 100,
  wants: Math.round(income * p.wants * 100) / 100,
  savings: Math.round(income * p.savings * 100) / 100,
});

export const monthKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

export const toMillis = (ts: any) =>
  ts && typeof ts.toMillis === 'function' ? ts.toMillis() : null;

export const toMonthDoc = (data: any): MonthDoc => ({
  month: data.month,
  income: data.income,
  percents: data.percents,
  allocations: data.allocations,
  startDay: data.startDay,
  periodStart: data.periodStart,
  periodEnd: data.periodEnd,
  createdAt: toMillis(data.createdAt),
  updatedAt: toMillis(data.updatedAt),
});
