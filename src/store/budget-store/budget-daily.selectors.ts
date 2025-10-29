import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { Bucket } from '../../api/types/bucket.types';
import { selectBudgetTxns } from './budget.selectors.base';

/** Helper: YYYY-MM-DD in UTC (stable across DST) */
function toYMDUTC(d: Date): string {
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString().slice(0, 10); // "YYYY-MM-DD"
}

/** Accepts Date or string-like input */
function keyFromInput(date: Date | string): string {
  if (typeof date === 'string') return toYMDUTC(new Date(date));
  return toYMDUTC(date);
}

type DailyBucketTotals = {
  total: number;
  needs: number;
  wants: number;
  savings: number;
};

/**
 * Builds a Map<YYYY-MM-DD, DailyBucketTotals>
 * Sums ABS(amount) so it’s robust whether spends are stored negative or positive.
 * If you also store income as positive entries, filter those out here as needed.
 */
// export const selectDailySpendMap = createSelector(
//   [selectBudgetTxns],
//   (txns): Map<string, DailyBucketTotals> => {
//     const map = new Map<string, DailyBucketTotals>();

//     for (const tx of txns) {
//       // Adjust these field names if your Txn shape differs:
//       // tx.date (Date | string), tx.amount (number), tx.type ('needs' | 'wants' | 'savings')
//       const key = keyFromInput(tx.date as any);
//       const amt = Math.abs(Number(tx.amount) || 0);

//       // If you need to exclude non-spend transactions, add a guard here:
//       // if (tx.kind === 'income') continue;

//       const prev = map.get(key) || { total: 0, needs: 0, wants: 0, savings: 0 };
//       prev.total += amt;
//       if (tx.type === 'needs' || tx.type === 'wants' || tx.type === 'savings') {
//         (prev as any)[tx.type] += amt;
//       }
//       map.set(key, prev);
//     }

//     return map;
//   },
// );

/** Total spent on a specific day (all buckets). */
export const makeSelectSpentOnDay = (date: Date | string) =>
  createSelector([selectDailySpendMap], (m) => m.get(keyFromInput(date))?.total ?? 0);

/** Total spent on a specific day for a given bucket. */
export const makeSelectSpentOnDayBucket = (date: Date | string, bucket: Bucket) =>
  createSelector([selectDailySpendMap], (m) => m.get(keyFromInput(date))?.[bucket] ?? 0);

/** Optional: get the whole per-bucket breakdown for that day. */
export const makeSelectDayBreakdown = (date: Date | string) =>
  createSelector(
    [selectDailySpendMap],
    (m) => m.get(keyFromInput(date)) ?? { total: 0, needs: 0, wants: 0, savings: 0 },
  );

/** Map<"YYYY-MM-DD", { total, needs, wants, savings }> */
export const selectDailySpendMap = createSelector(
  [selectBudgetTxns],
  (txns): Map<string, DailyBucketTotals> => {
    const map = new Map<string, DailyBucketTotals>();
    for (const tx of txns) {
      // Adjust field names if needed: tx.date, tx.amount, tx.type: Bucket
      const key = keyFromInput(tx.date as any);
      const amt = Math.abs(Number(tx.amount) || 0);

      // If you store incomes/transfers among txns, skip them here
      // if (tx.kind !== 'expense') continue;

      const rec = map.get(key) ?? { total: 0, needs: 0, wants: 0, savings: 0 };
      rec.total += amt;
      if (tx.type === 'needs' || tx.type === 'wants' || tx.type === 'savings') {
        (rec as any)[tx.type] += amt;
      }
      map.set(key, rec);
    }
    return map;
  },
);

export const selectDailySpendQuery = createSelector(
  [selectDailySpendMap],
  (map) =>
    (date: Date | string, bucket?: Bucket): number => {
      const rec = map.get(keyFromInput(date));
      if (!rec) return 0;
      return bucket ? rec[bucket] : rec.total;
    },
);

// export const selectDailySpendQueryByDate = createSelector(
//   [selectDailySpendMap],
//   (map) =>
//     (date: Date | string, bucket?: Bucket): number => {
//       const rec = map.get(keyFromInput(date));
//       if (!rec) return 0;
//       return bucket ? rec[bucket] : rec.total;
//     },
// );
