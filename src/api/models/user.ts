import { PercentTriple } from '../types/percent.types';
import { Currency, Language, Theme } from '../types/settings.types';

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
  currency?: Currency; // 'USD' | 'EUR' | ...
  defaultPercents?: PercentTriple;
  startDay?: number; // 1..28
  language?: Language; // app language
  theme?: Theme; // app theme
  onboardingCompleted: boolean;
}

export interface OnboardingData {
  percents: PercentTriple;
  language: Language;
  startDay: number;
}
