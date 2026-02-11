import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { Currency, Language } from '@api/types';
import { MultiNonFormProp } from '../multi-step-form.component';
import { setLanguage } from '@store/settings-store';
import { AppDispatch } from '@store/store';
import { FauxRadios } from '@shared/ui';

const StepTwo: React.FC<MultiNonFormProp> = ({ formData, setFormData }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { i18n } = useTranslation();

  const languageOptions: any[] = [
    { label: 'English', value: 'en' },
    { label: 'Română', value: 'ro' },
  ];

  const currencyOptions: any[] = [
    { label: 'Euro (€)', value: 'EUR' },
    { label: 'Romanian Leu (RON)', value: 'RON' },
  ];

  const handleLanguageChange = (lang: Language) => {
    setFormData((prev) => {
      return { ...prev, language: lang };
    });
    dispatch(setLanguage(lang));
    i18n.changeLanguage(lang);
  };

  return (
    <div className="step-two">
      <p className="step-p">
        <Trans i18nKey="onboarding:step2.text1" components={{ bold: <strong /> }} />
      </p>
      <div className="language-input-container">
        <FauxRadios
          value={formData.language}
          setValue={(lang) => handleLanguageChange(lang as Language)}
          title={''}
          valueList={languageOptions}
        />
      </div>

      <p className="step-p step-mt">
        <Trans i18nKey="onboarding:step2.text2" components={{ bold: <strong /> }} />
      </p>
      <div className="language-input-container">
        <FauxRadios
          value={formData.currency}
          setValue={(curr) =>
            setFormData((prev) => {
              return { ...prev, currency: curr as Currency };
            })
          }
          title={''}
          valueList={currencyOptions}
        />
      </div>
      <p className="step-p step-mt">
        <Trans i18nKey="onboarding:step2.text3" components={{ bold: <strong /> }} />
      </p>
    </div>
  );
};

export default StepTwo;
