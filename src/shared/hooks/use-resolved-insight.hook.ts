import { useTranslation } from 'react-i18next';

import { useFormatMoney } from '@shared/hooks';
import { Insight } from '@api/models/insight';

export const useResolvedInsight = () => {
  const { t } = useTranslation(['insights', 'budget']);
  // const fmt = useFormatMoney();

  const resolve = (insight: Insight) => {
    const rawVars = insight.vars ?? {};

    // Resolve bucketNameKey -> localized string if present
    const bucketName =
      typeof rawVars.bucketNameKey === 'string' ? (t(rawVars.bucketNameKey) as string) : undefined;

    // Convert raw numeric money vars -> formatted strings
    const vars = {
      ...rawVars,
      bucketName,
      amountPerDay: rawVars.amountPerDay?.toString(),
      delta: rawVars.delta?.toString(),
    };

    const chipRawVars = insight.chip?.vars;

    const chipVars = {
      ...chipRawVars,
      amountPerDay: chipRawVars?.amountPerDay?.toString(),
      days: chipRawVars?.days?.toString(),
    };

    return {
      title: insight.title ? (t(insight.title, { ...vars }) as string) : undefined,
      message: t(insight.message, { ...vars }) as string,
      subtext: insight.subtext ? (t(insight.subtext, { ...vars }) as string) : undefined,
      ctaLabel: insight.ctaLabel ? (t(insight.ctaLabel, { ...vars }) as string) : undefined,
      chip: insight.chip ? t(insight.chip.key, { ...chipVars }) : undefined,
    };
  };

  return { resolve };
};
