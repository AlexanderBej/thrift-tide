import { PercentTriple } from '../types/percent.types';

export type MinimalUser = {
  uuid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
};

export interface UserProfile {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  createdAt: Date;
  currency?: string; // 'USD' | 'EUR' | ...
  defaultPercents?: PercentTriple;
  startDay?: number; // 1..28
}
