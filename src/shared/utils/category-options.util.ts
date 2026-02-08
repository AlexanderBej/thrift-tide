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

import { CategoryOption } from '@api/models';
import { CategoryOptions, Bucket } from '@api/types';
import { getCssVar } from './style-variable.util';

export const CATEGORY_OPTIONS: CategoryOptions = {
  needs: [
    {
      label: 'Rent / Mortgage',
      i18nLabel: 'budget:categories.needs.rent',
      icon: TbHomeDollar,
      value: 'rent',
      color: '#4e79a7',
    },
    {
      label: 'Utilities',
      i18nLabel: 'budget:categories.needs.utilities',
      icon: FaRegLightbulb,
      value: 'utilities',
      color: '#f28e2b',
    },
    {
      label: 'Groceries',
      i18nLabel: 'budget:categories.needs.groceries',
      icon: GiShoppingCart,
      value: 'groceries',
      color: '#e15759',
    },
    {
      label: 'Transport',
      i18nLabel: 'budget:categories.needs.transport',
      icon: MdDirectionsCar,
      value: 'transport',
      color: '#76b7b2',
    },
    {
      label: 'Insurance',
      i18nLabel: 'budget:categories.needs.insurance',
      icon: IoShieldCheckmarkOutline,
      value: 'insurance',
      color: '#59a14f',
    },
    {
      label: 'Healthcare',
      i18nLabel: 'budget:categories.needs.healthcare',
      icon: MdLocalHospital,
      value: 'healthcare',
      color: '#edc948',
    },
    {
      label: 'Education',
      i18nLabel: 'budget:categories.needs.education',
      icon: PiBookOpenTextLight,
      value: 'education',
      color: '#b07aa1',
    },
  ],
  wants: [
    {
      label: 'Dining Out',
      i18nLabel: 'budget:categories.wants.dining',
      icon: MdRestaurant,
      value: 'dining',
      color: '#4e79a7',
    },
    {
      label: 'Entertainment',
      i18nLabel: 'budget:categories.wants.entertainments',
      icon: MdOutlineMovie,
      value: 'entertainments',
      color: '#f28e2b',
    },
    {
      label: 'Shopping',
      i18nLabel: 'budget:categories.wants.shopping',
      icon: FiShoppingBag,
      value: 'shopping',
      color: '#e15759',
    },
    {
      label: 'Travel',
      i18nLabel: 'budget:categories.wants.travel',
      icon: TbPlaneDeparture,
      value: 'travel',
      color: '#76b7b2',
    },
    {
      label: 'Subscriptions',
      i18nLabel: 'budget:categories.wants.subscriptions',
      icon: RiNetflixFill,
      value: 'subscriptions',
      color: '#59a14f',
    },
    {
      label: 'Hobbies',
      i18nLabel: 'budget:categories.wants.hobbies',
      icon: GiGuitar,
      value: 'hobbies',
      color: '#edc948',
    },
    {
      label: 'Beauty & Wellness',
      i18nLabel: 'budget:categories.wants.beauty',
      icon: GiLotusFlower,
      value: 'beauty',
      color: '#b07aa1',
    },
  ],
  savings: [
    {
      label: 'Emergency Fund',
      i18nLabel: 'budget:categories.savings.emergency',
      icon: MdSavings,
      value: 'emergency',
      color: '#4e79a7',
    },
    {
      label: 'Investments',
      i18nLabel: 'budget:categories.savings.investment',
      icon: MdTrendingUp,
      value: 'investment',
      color: '#f28e2b',
    },
    {
      label: 'Retirement',
      i18nLabel: 'budget:categories.savings.retirement',
      icon: GiStairsGoal,
      value: 'retirement',
      color: '#e15759',
    },
    {
      label: 'Big Purchase',
      i18nLabel: 'budget:categories.savings.big_purchase',
      icon: TbPigMoney,
      value: 'big_purchase',
      color: '#76b7b2',
    },
    {
      label: 'Vacation Fund',
      i18nLabel: 'budget:categories.savings.vacation',
      icon: PiTreePalm,
      value: 'vacation',
      color: '#59a14f',
    },
    {
      label: 'Education Fund',
      i18nLabel: 'budget:categories.savings.education_fund',
      icon: PiGraduationCapLight,
      value: 'education_fund',
      color: '#edc948',
    },
    {
      label: 'Debt Payments',
      i18nLabel: 'budget:categories.savings.debt_payments',
      icon: HiOutlineBanknotes,
      value: 'debt_payments',
      color: '#b07aa1',
    },
  ],
};

export function getCategoryColor(value: string): string {
  for (const group of Object.values(CATEGORY_OPTIONS)) {
    const match = group.find((cat) => cat.value === value);
    if (match) return match.color;
  }
  return getCssVar('--cat-10');
}
export const getCategoriesByType = (type: Bucket): CategoryOption[] => CATEGORY_OPTIONS[type];

const norm = (s: string) => s.trim().toLowerCase();

// Precompute lookups for O(1) resolves.
const VALUE_LOOKUP: Record<string, CategoryOption & { type: Bucket }> = {};
const LABEL_LOOKUP: Record<string, CategoryOption & { type: Bucket }> = {};

Object.entries(CATEGORY_OPTIONS).forEach(([type, list]) => {
  list.forEach((opt) => {
    VALUE_LOOKUP[norm(opt.value)] = { ...opt, type: type as Bucket };
    LABEL_LOOKUP[norm(opt.label)] = { ...opt, type: type as Bucket };
  });
});

// --- API -------------------------------------------------------

/**
 * Resolve any incoming category string to a display-ready object.
 * Matches by `value` first, then by `label` (both case-insensitive).
 * Falls back to a generic icon + original text for customs (e.g. "Amy's birthday").
 */
export function resolveCategory(input: string): CategoryOption {
  const key = norm(input);

  // Prefer canonical "value" match
  const byValue = VALUE_LOOKUP[key];
  if (byValue) {
    return {
      label: byValue.label,
      value: byValue.value,
      icon: byValue.icon,
      color: getCategoryColor(byValue.value),
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
      color: getCategoryColor(byLabel.value),
      i18nLabel: byLabel.i18nLabel,
    };
  }

  // Fallback: custom category
  return {
    label: input, // show exactly what the user wrote
    value: input, // keep raw value
    icon: TbCategory, // generic icon
    color: getCategoryColor(input),
    i18nLabel: input,
  };
}

/** Quick helper if you only need to know whether it’s predefined. */
export function isPredefinedCategory(value: string): boolean {
  const key = norm(value);
  return !!(VALUE_LOOKUP[key] || LABEL_LOOKUP[key]);
}
