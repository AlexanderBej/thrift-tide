import { PercentTriple } from '../types/percent.types';

export interface MonthDoc {
  month: string;
  income: number;
  percents: PercentTriple;
  allocations: { needs: number; wants: number; savings: number };
  createdAt: number | null;
  updatedAt: number | null;
}
