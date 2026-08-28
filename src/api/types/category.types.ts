import { TbHomeStar } from 'react-icons/tb';
import { GiWantedReward } from 'react-icons/gi';
import { MdDataSaverOn } from 'react-icons/md';

export type Category = 'needs' | 'wants' | 'savings';

export enum CategoryType {
  NEEDS = 'needs',
  WANTS = 'wants',
  SAVINGS = 'savings',
}

export const CATEGORY_COLOR_VARS: Record<Category, string> = {
  needs: '--color-category-needs',
  wants: '--color-category-wants',
  savings: '--color-category-savings',
};

export const getCategoryColorVar = (category: Category) => `var(${CATEGORY_COLOR_VARS[category]})`;

export const CATEGORY_ICONS = {
  needs: TbHomeStar,
  wants: GiWantedReward,
  savings: MdDataSaverOn,
};
