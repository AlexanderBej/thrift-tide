import { IconType } from 'react-icons';
import { SiNeutralinojs } from 'react-icons/si';
import { IoWarning } from 'react-icons/io5';
import { LuPartyPopper } from 'react-icons/lu';
import { IoIosInformationCircleOutline } from 'react-icons/io';
import { MdOutlineDangerous } from 'react-icons/md';

import { getCssVar } from './style-variable.util';
import { HistoryBadge, MonthDocSummary } from '@api/models';

export const toneConverter = (tone: string): { color: string; icon: IconType } => {
  switch (tone) {
    case 'danger':
      return { color: getCssVar('--error'), icon: MdOutlineDangerous };
    case 'info':
      return { color: getCssVar('--eg-1'), icon: IoIosInformationCircleOutline };
    case 'success':
      return { color: getCssVar('--success'), icon: LuPartyPopper };
    case 'warn':
      return { color: getCssVar('--warning'), icon: IoWarning };
    default:
      return { color: getCssVar('--color-primary-dark'), icon: SiNeutralinojs };
  }
};

export function historyStatusBadge(summary?: MonthDocSummary): HistoryBadge {
  if (!summary) return { tone: 'muted', labelKey: 'insights:badges.noSummary' };

  const alloc =
    (summary.allocations?.needs ?? 0) +
    (summary.allocations?.wants ?? 0) +
    (summary.allocations?.savings ?? 0);

  const spent = summary.totalSpent ?? 0;

  if (alloc <= 0) return { tone: 'muted', labelKey: 'insights:historyBadges.noBudget' };
  if ((summary.totalTxns ?? 0) === 0 && spent === 0)
    return { tone: 'info', labelKey: 'insights:historyBadges.noSpending' };

  const ratio = spent / alloc;

  if (ratio > 1.0) {
    return {
      tone: 'danger',
      labelKey: 'insights:historyBadges.overspent',
    };
  }

  if (ratio >= 0.9) return { tone: 'warn', labelKey: 'insights:historyBadges.nearLimit' };

  return { tone: 'success', labelKey: 'insights:historyBadges.healthy' };
}
