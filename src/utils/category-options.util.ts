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
import { CategoryOptions } from '../api/types/category-options.types';
import { Bucket } from '../api/types/bucket.types';
import { CategoryOption } from '../api/models/category-option';
import { getCssVar } from './style-variable.util';

export const CATEGORY_OPTIONS: CategoryOptions = {
  needs: [
    { label: 'Rent / Mortgage', icon: TbHomeDollar, value: 'rent', color: getCssVar('--cat-1') },
    { label: 'Utilities', icon: FaRegLightbulb, value: 'utilities', color: getCssVar('--cat-2') },
    { label: 'Groceries', icon: GiShoppingCart, value: 'groceries', color: getCssVar('--cat-3') },
    { label: 'Transport', icon: MdDirectionsCar, value: 'transport', color: getCssVar('--cat-4') },
    {
      label: 'Insurance',
      icon: IoShieldCheckmarkOutline,
      value: 'insurance',
      color: getCssVar('--cat-5'),
    },
    {
      label: 'Healthcare',
      icon: MdLocalHospital,
      value: 'healthcare',
      color: getCssVar('--cat-6'),
    },
    {
      label: 'Education',
      icon: PiBookOpenTextLight,
      value: 'education',
      color: getCssVar('--cat-7'),
    },
  ],
  wants: [
    { label: 'Dining Out', icon: MdRestaurant, value: 'dining', color: getCssVar('--cat-1') },
    {
      label: 'Entertainment',
      icon: MdOutlineMovie,
      value: 'entertainments',
      color: getCssVar('--cat-2'),
    },
    { label: 'Shopping', icon: FiShoppingBag, value: 'shopping', color: getCssVar('--cat-3') },
    { label: 'Travel', icon: TbPlaneDeparture, value: 'travel', color: getCssVar('--cat-4') },
    {
      label: 'Subscriptions',
      icon: RiNetflixFill,
      value: 'subscriptions',
      color: getCssVar('--cat-5'),
    },
    { label: 'Hobbies', icon: GiGuitar, value: 'hobbies', color: getCssVar('--cat-6') },
    {
      label: 'Beauty & Wellness',
      icon: GiLotusFlower,
      value: 'beauty',
      color: getCssVar('--cat-7'),
    },
  ],
  savings: [
    { label: 'Emergency Fund', icon: MdSavings, value: 'emergency', color: getCssVar('--cat-1') },
    { label: 'Investments', icon: MdTrendingUp, value: 'investment', color: getCssVar('--cat-2') },
    { label: 'Retirement', icon: GiStairsGoal, value: 'retirement', color: getCssVar('--cat-3') },
    { label: 'Big Purchase', icon: TbPigMoney, value: 'big_purchase', color: getCssVar('--cat-4') },
    { label: 'Vacation Fund', icon: PiTreePalm, value: 'vacation', color: getCssVar('--cat-5') },
    {
      label: 'Education Fund',
      icon: PiGraduationCapLight,
      value: 'education_fund',
      color: getCssVar('--cat-6'),
    },
    {
      label: 'Debt Payments',
      icon: HiOutlineBanknotes,
      value: 'debt_payments',
      color: getCssVar('--cat-7'),
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
      // type: byValue.type,
      // isCustom: false,
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
      // type: byLabel.type,
      // isCustom: false,
    };
  }

  // Fallback: custom category
  return {
    label: input, // show exactly what the user wrote
    value: input, // keep raw value
    icon: TbCategory, // generic icon
    color: getCategoryColor(input),
    // isCustom: true,
  };
}

/** Quick helper if you only need to know whether it’s predefined. */
export function isPredefinedCategory(value: string): boolean {
  const key = norm(value);
  return !!(VALUE_LOOKUP[key] || LABEL_LOOKUP[key]);
}
