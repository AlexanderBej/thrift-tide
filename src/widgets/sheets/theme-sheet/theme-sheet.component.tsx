import React, { useState } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { IconType } from 'react-icons';
import { FaCheck, FaMoon, FaSun } from 'react-icons/fa';

import { BaseSheet, TTIcon } from '@shared/ui';
import { AppDispatch, Theme } from '@api/types';
import { selectAuthUser } from '@store/auth-store';
import { selectSettingsAppTheme, setAppThemeThunk } from '@store/settings-store';

import '../_selection-sheet.scss';

interface ThemeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ThemeSheet: React.FC<ThemeSheetProps> = ({ open, onOpenChange }) => {
  const { t } = useTranslation(['settings']);
  const dispatch = useDispatch<AppDispatch>();

  const theme = useSelector(selectSettingsAppTheme);
  const user = useSelector(selectAuthUser);
  const [savingTheme, setSavingTheme] = useState<Theme | null>(null);

  const themeOptions: { icon: IconType; label: string; value: Theme; color: string }[] = [
    { label: t('theme.labelLight'), value: 'light', icon: FaSun, color: 'yellow' },
    { label: t('theme.labelDark'), value: 'dark', icon: FaMoon, color: 'white' },
  ];

  const handleSelect = async (nextTheme: Theme) => {
    if (!user || savingTheme) return;
    if (nextTheme === theme) {
      onOpenChange(false);
      return;
    }

    setSavingTheme(nextTheme);
    try {
      await dispatch(setAppThemeThunk({ uid: user.uuid, theme: nextTheme })).unwrap();
      onOpenChange(false);
    } catch {
      // Keep the sheet open on failure.
    } finally {
      setSavingTheme(null);
    }
  };

  return (
    <BaseSheet
      open={open}
      onOpenChange={onOpenChange}
      title={String(t('theme.title'))}
      description={String(t('theme.subtitle'))}
      variant="compact"
    >
      <div className="selection-sheet">
        {themeOptions.map((option) => {
          const isActive = theme === option.value;
          const isSaving = savingTheme === option.value;

          return (
            <button
              key={option.value}
              type="button"
              className={clsx('selection-row', { active: isActive })}
              onClick={() => handleSelect(option.value)}
              aria-pressed={isActive}
              disabled={!!savingTheme}
            >
              <span className="selection-row__badge" aria-hidden="true">
                <TTIcon icon={option.icon} size={21} color={option.color} />
              </span>
              <span className="selection-row__label">{option.label}</span>
              <span className="selection-row__state">
                {(isActive || isSaving) && (
                  <TTIcon icon={FaCheck} size={15} color="var(--color-primary)" />
                )}
              </span>
            </button>
          );
        })}
      </div>
    </BaseSheet>
  );
};

export default ThemeSheet;
