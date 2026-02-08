import { TbHomeStar } from 'react-icons/tb';
import { GiWantedReward } from 'react-icons/gi';
import { MdDataSaverOn } from 'react-icons/md';

import { getCssVar } from '@shared/utils';

export type Category = 'needs' | 'wants' | 'savings';

export enum CategoryType {
  NEEDS = 'needs',
  WANTS = 'wants',
  SAVINGS = 'savings',
}

export const CATEGORY_COLORS = {
  needs: getCssVar('--needs'), // green
  wants: getCssVar('--wants'), // blue
  savings: getCssVar('--savings'), // gold
};

export const CATEGORY_LIGHT_COLORS = {
  needs: getCssVar('--needs-light'), // green
  wants: getCssVar('--wants-light'), // blue
  savings: getCssVar('--savings-light'), // gold
};

export const CATEGORY_ICONS = {
  needs: TbHomeStar,
  wants: GiWantedReward,
  savings: MdDataSaverOn,
};
