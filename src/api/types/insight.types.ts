import { Insight } from '@api/models';

export type InsightTone = 'success' | 'warn' | 'danger' | 'info' | 'muted';
export type InsightTarget =
  | 'insights'
  | 'transactions'
  | 'buckets'
  | 'bucket:needs'
  | 'bucket:wants'
  | 'bucket:savings';

export const toneWeight: Record<InsightTone, number> = {
  danger: 500,
  warn: 300,
  info: 200,
  success: 120,
  muted: 0,
};

export type BucketInsightCandidate = Insight & {
  // local-only meta for ranking (not rendered)
  _scoreHint?: {
    daysToZero?: number | null;
    burn?: number | null;
    pace?: number | null;
    remainingPerDayRatio?: number | null; // remaining/day vs normal/day
  };
};
