import React, { ReactNode, useState } from 'react';
import clsx from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import { FaCheck } from 'react-icons/fa6';
import { RO, GB } from 'country-flag-icons/react/3x2';
import { useTranslation } from 'react-i18next';

import { BaseSheet, TTIcon } from '@shared/ui';
import { saveLanguageThunk, selectSettingsAppLanguage } from '@store/settings-store';
import { AppDispatch, Language } from '@api/types';
import { selectAuthUser } from '@store/auth-store';

import '../_selection-sheet.scss';

interface LanguageSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const languageOptions: { flag: ReactNode; label: string; value: Language }[] = [
  { label: 'English', value: 'en', flag: <GB title="United Kingdom" style={{ width: 28 }} /> },
  { label: 'Română', value: 'ro', flag: <RO title="Romania" style={{ width: 28 }} /> },
];

const LanguageSheet: React.FC<LanguageSheetProps> = ({ open, onOpenChange }) => {
  const { t } = useTranslation(['settings']);
  const dispatch = useDispatch<AppDispatch>();

  const language = useSelector(selectSettingsAppLanguage);
  const user = useSelector(selectAuthUser);
  const [savingLanguage, setSavingLanguage] = useState<Language | null>(null);

  const handleSelect = async (nextLanguage: Language) => {
    if (!user || savingLanguage) return;
    if (nextLanguage === language) {
      onOpenChange(false);
      return;
    }

    setSavingLanguage(nextLanguage);
    try {
      await dispatch(saveLanguageThunk({ uid: user.uuid, language: nextLanguage })).unwrap();
      onOpenChange(false);
    } catch {
      // Keep the sheet open on failure.
    } finally {
      setSavingLanguage(null);
    }
  };

  return (
    <BaseSheet
      open={open}
      onOpenChange={onOpenChange}
      title={String(t('language.title'))}
      description={String(t('language.subtitle'))}
      variant="compact"
    >
      <div className="selection-sheet">
        {languageOptions.map((lang) => {
          const isActive = language === lang.value;
          const isSaving = savingLanguage === lang.value;

          return (
            <button
              key={lang.value}
              type="button"
              className={clsx('selection-row', { active: isActive })}
              onClick={() => handleSelect(lang.value)}
              aria-pressed={isActive}
              disabled={!!savingLanguage}
            >
              <span className="selection-row__badge" aria-hidden="true">
                {lang.flag}
              </span>
              <span className="selection-row__label">{lang.label}</span>
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

export default LanguageSheet;
