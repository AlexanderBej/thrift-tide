import { Insight } from '@api/models';
import {
  BucketInsightCandidate,
  toneWeight,
  type Bucket,
  type InsightTarget,
  type InsightTone,
} from '@api/types';

export const clampPct = (n: number) => Math.max(0, Math.min(1, n));
export const toPctInt = (ratio: number | null | undefined) =>
  ratio == null ? null : Math.round(clampPct(ratio) * 100);

/**
 * We pass bucketNameKey instead of a raw localized string,
 * so i18n can localize inside the insight itself:
 *   t(insight.messageKey, { bucketName: t(bucketNameKey), ... })
 */
export const bucketNameKey = (b: Bucket) => `insights.bucketNames.${b}` as const;

export const toPathFromInsightTarget = (target: InsightTarget): string => {
  if (target === 'insights') return '/insights';
  if (target === 'transactions') return '/transactions';
  if (target === 'buckets') return '/buckets';

  // bucket deep link: "bucket:wants"
  if (target.startsWith('bucket:')) {
    const bucket = target.split(':')[1];
    return `/buckets?bucket=${encodeURIComponent(bucket)}`;
  }

  // fallback
  return '/';
};
