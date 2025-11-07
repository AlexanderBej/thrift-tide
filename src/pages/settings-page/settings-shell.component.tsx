import React from 'react';

import { useWindowWidth } from '../../utils/window-width.hook';
import { PercentTriple } from '../../api/types/percent.types';
import { Currency, Language, Theme } from '../../api/types/settings.types';
import DesktopSettingsPage from './pages/desktop-settings-page/desktop-settings-page.component';
import MobileSettingsPage from './pages/mobile-settings-page/mobile-settings-page.component';

export interface SettingsFormData {
  percents: PercentTriple;
  startDay: number;
  currency: Currency;
  language: Language;
  theme: Theme;
  displayName: string;
}

type SaveKey = keyof SettingsFormData;

export interface SettingsSectionProps {
  formData: SettingsFormData;
  withBackground?: boolean;
  setFormData: React.Dispatch<React.SetStateAction<SettingsFormData>>;
  runSave: <K extends SaveKey>(key: K) => Promise<void>;
  resetData: <K extends keyof SettingsFormData>(key: K, value: SettingsFormData[K]) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const SettingsShell: React.FC = () => {
  const width = useWindowWidth();
  const isMobile = width < 480;

  return isMobile ? <MobileSettingsPage /> : <DesktopSettingsPage />;
};

export default SettingsShell;
