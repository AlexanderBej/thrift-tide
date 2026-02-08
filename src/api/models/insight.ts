import { InsightTarget, InsightTone } from '@api/types';

export interface InsightChip {
  key: string;
  vars?: Record<string, any>;
}

export interface Insight {
  id: string;
  tone: InsightTone;
  title?: string; // optional, e.g. "Insight" / "Heads up"
  message: string; // main sentence
  vars?: Record<string, string | number>; // interpolation vars for i18n
  subtext?: string; // optional: “Based on current pace”
  ctaLabel?: string; // “See insights”
  ctaTarget?: InsightTarget;
  chip?: InsightChip;
  group?: string;
}
