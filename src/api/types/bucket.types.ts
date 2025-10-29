import { TbHomeStar } from 'react-icons/tb';
import { GiWantedReward } from 'react-icons/gi';
import { MdDataSaverOn } from 'react-icons/md';

export type Bucket = 'needs' | 'wants' | 'savings';

export enum BucketType {
  NEEDS = 'needs',
  WANTS = 'wants',
  SAVINGS = 'savings',
}

export const BUCKET_COLORS = {
  needs: '#2ecc71', // green
  wants: '#5dade2', // blue
  savings: '#f4b63f', // gold
};

export const BUCKET_LIGHT_COLORS = {
  needs: '#d5f5e2', // green
  wants: '#dfeff9', // blue
  savings: '#fdf0d9', // gold
};

export const BUCKET_ICONS = {
  needs: TbHomeStar,
  wants: GiWantedReward,
  savings: MdDataSaverOn,
};

export const getTxnColor = (type: Bucket) => BUCKET_COLORS[type];
