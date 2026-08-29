export type Language = 'en' | 'ro';

export type Theme = 'light' | 'dark';

export enum Themes {
  LIGHT = 'light',
  DARK = 'dark',
}

export type Currency = 'EUR' | 'RON';

export interface CapturePreferences {
  noteExpandedByDefault?: boolean;
}

export const DEFAULT_LANGUAGE = 'en';
export const DEFAULT_THEME = 'light';
export const DEFAULT_CURRENCY = 'EUR';
export const DEFAULT_CAPTURE_PREFERENCES: CapturePreferences = {
  noteExpandedByDefault: false,
};
