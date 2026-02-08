import { Bucket, InsightTone } from '@api/types';
import { PercentTriple } from '../types/percent.types';
import { Insight } from './insight';

export interface MonthDoc {
  month: string;
  income: number;
  percents: PercentTriple;
  allocations: { needs: number; wants: number; savings: number };
  startDay: number; // NEW: the start day used when this doc was created (frozen)
  periodStart: string; // NEW: ISO e.g. "2025-10-25T00:00:00.000Z"
  periodEnd: string; // NEW: ISO (exclusive)
  createdAt: number | null;
  updatedAt: number | null;
  summary?: MonthDocSummary;
}

export interface MonthDocSummary {
  totalSpent: number;
  spent: { needs: number; wants: number; savings: number };
  totalTxns: number;

  income: number; // snapshot (helps charting without reading doc again)
  allocations: { needs: number; wants: number; savings: number };

  computedAt: string; // ISO
}

export const DEFAULT_START_DAY = 25;

export interface BucketHealthSummary {
  healthyCount: number;
  attentionCount: number;
  details: Array<{
    bucket: Bucket;
    tone: InsightTone;
    insight: Insight;
  }>;
}

export interface HistoryDocWithSummary {
  id: string;
  month: string;
  percents: { needs: number; wants: number; savings: number };
  summary: MonthDocSummary;
}

export interface HistoryBadge {
  tone: InsightTone;
  labelKey: string;
}
