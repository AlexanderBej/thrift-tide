import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { Language } from '@api/types';
import { MultiFormProp } from '../multi-step-form.component';
import { Select, SelectOption } from '@shared/ui';
import { setLanguage } from '@store/settings-store';
import { AppDispatch } from '@store/store';

const StepTwo: React.FC<MultiFormProp> = ({ formData, onChange }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { i18n } = useTranslation();

  const languageOptions: SelectOption[] = [
    { label: 'English', value: 'en' },
    { label: 'Română', value: 'ro' },
  ];

  const currencyOptions: SelectOption[] = [
    { label: 'Euro (€)', value: 'EUR' },
    { label: 'Romanian Leu (RON)', value: 'RON' },
  ];

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e);
    const lang = e.target.value as Language;
    dispatch(setLanguage(lang));
    i18n.changeLanguage(lang);
  };

  return (
    <div className="step-two">
      <p className="step-p">
        <Trans i18nKey="onboarding.step2.text1" components={{ bold: <strong /> }} />
      </p>
      <div className="language-input-container">
        <Select
          name="language"
          value={formData.language}
          options={languageOptions}
          onChange={handleLanguageChange}
          label="Language"
          customClassName="onboarding-select"
        />
      </div>

      <p className="step-p step-mt">
        <Trans i18nKey="onboarding.step2.text2" components={{ bold: <strong /> }} />
      </p>
      <div className="language-input-container">
        <Select
          name="currency"
          value={formData.currency}
          options={currencyOptions}
          onChange={onChange}
          label="Currency"
          customClassName="onboarding-select"
        />
      </div>
      <p className="step-p step-mt">
        <Trans i18nKey="onboarding.step2.text3" components={{ bold: <strong /> }} />
      </p>
    </div>
  );
};

export default StepTwo;
