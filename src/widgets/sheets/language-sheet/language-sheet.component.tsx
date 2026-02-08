import React, { useState } from 'react';
import clsx from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import { FaCheck } from 'react-icons/fa6';

import { BaseSheet, TTIcon } from '@shared/ui';
import { saveLanguageThunk, selectSettingsAppLanguage } from '@store/settings-store';
import { AppDispatch, Language } from '@api/types';

import './language-sheet.styles.scss';
import { selectAuthUser } from '@store/auth-store';
import { getCssVar } from '@shared/utils';
import { useTranslation } from 'react-i18next';

interface LanguageSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LanguageSheet: React.FC<LanguageSheetProps> = ({ open, onOpenChange }) => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch<AppDispatch>();

  const language = useSelector(selectSettingsAppLanguage);
  const user = useSelector(selectAuthUser);

  const [selectedLanguage, setSelectedLanguage] = useState<Language>(language);

  const languageOptions: { flag: string; label: string; value: string }[] = [
    { label: 'English', value: 'en', flag: '🇬🇧' },
    { label: 'Română', value: 'ro', flag: '🇷🇴' },
  ];

  const handleSubmit = () => {
    if (!user) return;
    dispatch(saveLanguageThunk({ uid: user?.uuid, language: selectedLanguage }))
      .unwrap()
      .then(() => {
        setTimeout(() => onOpenChange(false), 120);
      });
  };

  return (
    <BaseSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t('pageContent.settings.language')}
      btnDisabled={selectedLanguage === language}
      btnLabel="Change language"
      onButtonClick={handleSubmit}
    >
      <div className="language-selectors">
        {languageOptions.map((lang, index) => (
          <button
            key={index}
            className={clsx('language-block', { active: selectedLanguage === lang.value })}
            onClick={() => setSelectedLanguage(lang.value as Language)}
          >
            <div className="language-details">
              <span className="flag">{lang.flag}</span>
              <span>{lang.label}</span>
            </div>
            {selectedLanguage === lang.value && (
              <TTIcon icon={FaCheck} size={16} color={getCssVar('--color-primary')} />
            )}
          </button>
        ))}
      </div>
    </BaseSheet>
  );
};

export default LanguageSheet;
