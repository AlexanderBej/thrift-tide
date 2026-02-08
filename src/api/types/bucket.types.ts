import { TbHomeStar } from 'react-icons/tb';
import { GiWantedReward } from 'react-icons/gi';
import { MdDataSaverOn } from 'react-icons/md';

import { getCssVar } from '@shared/utils';

export type Bucket = 'needs' | 'wants' | 'savings';

export enum BucketType {
  NEEDS = 'needs',
  WANTS = 'wants',
  SAVINGS = 'savings',
}

export const BUCKET_COLORS = {
  needs: getCssVar('--needs'), // green
  wants: getCssVar('--wants'), // blue
  savings: getCssVar('--savings'), // gold
};

export const BUCKET_LIGHT_COLORS = {
  needs: getCssVar('--needs-light'), // green
  wants: getCssVar('--wants-light'), // blue
  savings: getCssVar('--savings-light'), // gold
};

export const BUCKET_ICONS = {
  needs: TbHomeStar,
  wants: GiWantedReward,
  savings: MdDataSaverOn,
};
