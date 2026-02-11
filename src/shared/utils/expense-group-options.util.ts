import { TbCategory, TbHomeDollar, TbPigMoney, TbPlaneDeparture } from 'react-icons/tb';
import { FaRegLightbulb } from 'react-icons/fa';
import { GiGuitar, GiLotusFlower, GiShoppingCart, GiStairsGoal } from 'react-icons/gi';
import {
  MdDirectionsCar,
  MdLocalHospital,
  MdOutlineMovie,
  MdRestaurant,
  MdSavings,
  MdTrendingUp,
} from 'react-icons/md';
import { IoShieldCheckmarkOutline } from 'react-icons/io5';
import { HiOutlineBanknotes } from 'react-icons/hi2';
import { PiBookOpenTextLight, PiTreePalm, PiGraduationCapLight } from 'react-icons/pi';
import { FiShoppingBag } from 'react-icons/fi';
import { RiNetflixFill } from 'react-icons/ri';

import { ExpenseGroupOption } from '@api/models';
import { ExpenseGroupOptions, Category } from '@api/types';
import { getCssVar } from './style-variable.util';

export const EXPENSE_GROUP_OPTIONS: ExpenseGroupOptions = {
  needs: [
    {
      label: 'Rent / Mortgage',
      i18nLabel: 'budget:expGroups.needs.rent',
      icon: TbHomeDollar,
      value: 'rent',
      color: '#4e79a7',
    },
    {
      label: 'Utilities',
      i18nLabel: 'budget:expGroups.needs.utilities',
      icon: FaRegLightbulb,
      value: 'utilities',
      color: '#f28e2b',
    },
    {
      label: 'Groceries',
      i18nLabel: 'budget:expGroups.needs.groceries',
      icon: GiShoppingCart,
      value: 'groceries',
      color: '#e15759',
    },
    {
      label: 'Transport',
      i18nLabel: 'budget:expGroups.needs.transport',
      icon: MdDirectionsCar,
      value: 'transport',
      color: '#76b7b2',
    },
    {
      label: 'Insurance',
      i18nLabel: 'budget:expGroups.needs.insurance',
      icon: IoShieldCheckmarkOutline,
      value: 'insurance',
      color: '#59a14f',
    },
    {
      label: 'Healthcare',
      i18nLabel: 'budget:expGroups.needs.healthcare',
      icon: MdLocalHospital,
      value: 'healthcare',
      color: '#edc948',
    },
    {
      label: 'Education',
      i18nLabel: 'budget:expGroups.needs.education',
      icon: PiBookOpenTextLight,
      value: 'education',
      color: '#b07aa1',
    },
  ],
  wants: [
    {
      label: 'Dining Out',
      i18nLabel: 'budget:expGroups.wants.dining',
      icon: MdRestaurant,
      value: 'dining',
      color: '#4e79a7',
    },
    {
      label: 'Entertainment',
      i18nLabel: 'budget:expGroups.wants.entertainments',
      icon: MdOutlineMovie,
      value: 'entertainments',
      color: '#f28e2b',
    },
    {
      label: 'Shopping',
      i18nLabel: 'budget:expGroups.wants.shopping',
      icon: FiShoppingBag,
      value: 'shopping',
      color: '#e15759',
    },
    {
      label: 'Travel',
      i18nLabel: 'budget:expGroups.wants.travel',
      icon: TbPlaneDeparture,
      value: 'travel',
      color: '#76b7b2',
    },
    {
      label: 'Subscriptions',
      i18nLabel: 'budget:expGroups.wants.subscriptions',
      icon: RiNetflixFill,
      value: 'subscriptions',
      color: '#59a14f',
    },
    {
      label: 'Hobbies',
      i18nLabel: 'budget:expGroups.wants.hobbies',
      icon: GiGuitar,
      value: 'hobbies',
      color: '#edc948',
    },
    {
      label: 'Beauty & Wellness',
      i18nLabel: 'budget:expGroups.wants.beauty',
      icon: GiLotusFlower,
      value: 'beauty',
      color: '#b07aa1',
    },
  ],
  savings: [
    {
      label: 'Emergency Fund',
      i18nLabel: 'budget:expGroups.savings.emergency',
      icon: MdSavings,
      value: 'emergency',
      color: '#4e79a7',
    },
    {
      label: 'Investments',
      i18nLabel: 'budget:expGroups.savings.investment',
      icon: MdTrendingUp,
      value: 'investment',
      color: '#f28e2b',
    },
    {
      label: 'Retirement',
      i18nLabel: 'budget:expGroups.savings.retirement',
      icon: GiStairsGoal,
      value: 'retirement',
      color: '#e15759',
    },
    {
      label: 'Big Purchase',
      i18nLabel: 'budget:expGroups.savings.big_purchase',
      icon: TbPigMoney,
      value: 'big_purchase',
      color: '#76b7b2',
    },
    {
      label: 'Vacation Fund',
      i18nLabel: 'budget:expGroups.savings.vacation',
      icon: PiTreePalm,
      value: 'vacation',
      color: '#59a14f',
    },
    {
      label: 'Education Fund',
      i18nLabel: 'budget:expGroups.savings.education_fund',
      icon: PiGraduationCapLight,
      value: 'education_fund',
      color: '#edc948',
    },
    {
      label: 'Debt Payments',
      i18nLabel: 'budget:expGroups.savings.debt_payments',
      icon: HiOutlineBanknotes,
      value: 'debt_payments',
      color: '#b07aa1',
    },
  ],
};

export function getExpGroupColor(value: string): string {
  for (const group of Object.values(EXPENSE_GROUP_OPTIONS)) {
    const match = group.find((ep) => ep.value === value);
    if (match) return match.color;
  }
  return getCssVar('--eg-10');
}
export const getExpGroupsByType = (type: Category): ExpenseGroupOption[] =>
  EXPENSE_GROUP_OPTIONS[type];

const norm = (s: string) => s.trim().toLowerCase();

// Precompute lookups for O(1) resolves.
const VALUE_LOOKUP: Record<string, ExpenseGroupOption & { type: Category }> = {};
const LABEL_LOOKUP: Record<string, ExpenseGroupOption & { type: Category }> = {};

Object.entries(EXPENSE_GROUP_OPTIONS).forEach(([type, list]) => {
  list.forEach((opt) => {
    VALUE_LOOKUP[norm(opt.value)] = { ...opt, type: type as Category };
    LABEL_LOOKUP[norm(opt.label)] = { ...opt, type: type as Category };
  });
});

// --- API -------------------------------------------------------

/**
 * Resolve any incoming bucket string to a display-ready object.
 * Matches by `value` first, then by `label` (both case-insensitive).
 * Falls back to a generic icon + original text for customs (e.g. "Amy's birthday").
 */
export function resolveExpenseGroup(input: string): ExpenseGroupOption {
  const key = norm(input);

  // Prefer canonical "value" match
  const byValue = VALUE_LOOKUP[key];
  if (byValue) {
    return {
      label: byValue.label,
      value: byValue.value,
      icon: byValue.icon,
      color: getExpGroupColor(byValue.value),
      i18nLabel: byValue.i18nLabel,
    };
  }

  // Allow matching by label too (useful if historical data stored labels)
  const byLabel = LABEL_LOOKUP[key];
  if (byLabel) {
    return {
      label: byLabel.label,
      value: byLabel.value,
      icon: byLabel.icon,
      color: getExpGroupColor(byLabel.value),
      i18nLabel: byLabel.i18nLabel,
    };
  }

  // Fallback: custom bucket
  return {
    label: input, // show exactly what the user wrote
    value: input, // keep raw value
    icon: TbCategory, // generic icon
    color: getExpGroupColor(input),
    i18nLabel: input,
  };
}

/** Quick helper if you only need to know whether it’s predefined. */
export function isPredefinedExpenseGroup(value: string): boolean {
  const key = norm(value);
  return !!(VALUE_LOOKUP[key] || LABEL_LOOKUP[key]);
}
