import React, { useState } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { IconType } from 'react-icons';
import { FaCheck } from 'react-icons/fa';
import { FaSun } from 'react-icons/fa';
import { FaMoon } from 'react-icons/fa';

import { BaseSheet, TTIcon } from '@shared/ui';
import { AppDispatch, Theme } from '@api/types';
import { getCssVar } from '@shared/utils';
import { selectAuthUser } from '@store/auth-store';
import { selectSettingsAppTheme, setAppThemeThunk } from '@store/settings-store';

import './theme-sheet.styles.scss';

interface ThemeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ThemeSheet: React.FC<ThemeSheetProps> = ({ open, onOpenChange }) => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch<AppDispatch>();

  const theme = useSelector(selectSettingsAppTheme);
  const user = useSelector(selectAuthUser);

  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(theme);

  const themeOptions: { icon: IconType; label: string; value: Theme }[] = [
    { label: t('settings:theme.labelLight'), value: 'light', icon: FaSun },
    { label: t('settings:theme.labelDark'), value: 'dark', icon: FaMoon },
  ];

  const handleSubmit = () => {
    if (!user) return;
    dispatch(setAppThemeThunk({ uid: user?.uuid, theme: selectedTheme as Theme }))
      .unwrap()
      .then(() => {
        setTimeout(() => onOpenChange(false), 120);
      });
  };

  const btnLabel = t('settings:theme.button');

  return (
    <BaseSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t('settings:theme.title')}
      btnDisabled={selectedTheme === theme}
      btnLabel={btnLabel}
      onButtonClick={handleSubmit}
    >
      <div className="theme-selectors">
        {themeOptions.map((t, index) => {
          const isActive = selectedTheme === t.value;
          const isLight = t.value === 'light';
          const color = isLight ? '#e3d919' : '#fcfbe1';
          const background = isLight ? '#fff' : '#262626';
          return (
            <button
              key={index}
              className={clsx('theme-block', { active: isActive })}
              onClick={() => setSelectedTheme(t.value as Theme)}
            >
              <div className="theme-details">
                <div className="theme-icon-wrapper" style={{ backgroundColor: background }}>
                  <TTIcon icon={t.icon} size={24} color={color} />
                </div>
                <span>{t.label}</span>
              </div>
              {isActive && <TTIcon icon={FaCheck} size={16} color={getCssVar('--color-primary')} />}
            </button>
          );
        })}
      </div>
    </BaseSheet>
  );
};

export default ThemeSheet;
