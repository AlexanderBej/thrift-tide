import { type Category, type InsightTarget } from '@api/types';

export const clampPct = (n: number) => Math.max(0, Math.min(1, n));
export const toPctInt = (ratio: number | null | undefined) =>
  ratio == null ? null : Math.round(clampPct(ratio) * 100);

/**
 * We pass catNameKey instead of a raw localized string,
 * so i18n can localize inside the insight itself:
 *   t(insight.messageKey, { catName: t(catNameKey), ... })
 */
export const catNameKey = (b: Category) => `taxonomy:categoryNames.${b}` as const;

export const toPathFromInsightTarget = (target: InsightTarget): string => {
  if (target === 'insights') return '/insights';
  if (target === 'transactions') return '/transactions';
  if (target === 'categories') return '/categories';

  // category deep link: "category:wants"
  if (target.startsWith('category:')) {
    const category = target.split(':')[1];
    return `/categories/${category}`;
  }

  // fallback
  return '/';
};
