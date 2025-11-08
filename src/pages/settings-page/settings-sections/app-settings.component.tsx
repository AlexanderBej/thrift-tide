import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Setting from '../setting/setting.component';
import { SettingsSectionProps } from '../settings-shell.component';
import { DEFAULT_THEME } from '@api/types';
import { SelectOption, CheckboxInput, Select } from '@shared/ui';
import {
  selectSettingsAppLanguage,
  selectSettingsAppTheme,
  selectSettingsStatus,
} from '@store/settings-store';

const AppSettings: React.FC<SettingsSectionProps> = ({
  formData,
  withBackground = false,
  setFormData,
  runSave,
  resetData,
  handleChange,
}) => {
  const { t } = useTranslation(['common', 'budget']);

  const language = useSelector(selectSettingsAppLanguage);
  const theme = useSelector(selectSettingsAppTheme);
  const status = useSelector(selectSettingsStatus);

  const themeChecked = formData.theme === 'dark';

  const handleThemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    const themeValue = checked ? 'dark' : 'light';

    setFormData((prev) => {
      return { ...prev, theme: themeValue };
    });
  };

  const languageOptions: SelectOption[] = [
    { label: 'English', value: 'en' },
    { label: 'Română', value: 'ro' },
  ];

  return (
    <>
      <Setting
        title={t('pageContent.settings.language') ?? 'Change the system language'}
        confirmMessage={
          t('confirmations.language') ?? 'Are you sure you want to change the language?'
        }
        confirmDisabled={language === formData.language}
        confirmLoading={status === 'loading'}
        onConfirmClick={() => runSave('language')}
        resetDisabled={language === formData.language}
        onResetClick={() => resetData('language', language)}
        withBackground={withBackground}
      >
        <Select
          name="language"
          customClassName="settings-selector"
          value={formData.language}
          options={languageOptions}
          onChange={handleChange}
        />
      </Setting>

      {!withBackground && <hr className="divider" />}

      <Setting
        title={t('pageContent.settings.theme') ?? 'Change your app theme'}
        showConfirm={false}
        confirmDisabled={theme === formData.theme}
        confirmLoading={status === 'loading'}
        onConfirmClick={() => runSave('theme')}
        resetDisabled={theme === formData.theme}
        onResetClick={() => resetData('theme', theme ?? DEFAULT_THEME)}
        withBackground={withBackground}
      >
        <CheckboxInput
          variant="switch"
          onText="Light"
          offText="Dark"
          name="theme"
          checked={themeChecked}
          onChange={handleThemeChange}
        />
      </Setting>
    </>
  );
};

export default AppSettings;
