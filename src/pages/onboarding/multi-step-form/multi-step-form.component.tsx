/* eslint-disable indent */
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import MultiStepProgressBar from './multi-step-progress-bar/multi-step-progress-bar.component';
import StepOne from './steps/step-one.component';
import StepTwo from './steps/step-two.component';
import StepThree from './steps/step-three.component';
import StepFour from './steps/step-four.component';
import StepFive from './steps/step-five.component';
import { Button } from '@shared/ui';
import { selectAuthUser } from '@store/auth-store';
import {
  selectSettingsStatus,
  selectOnboardingSettings,
  completeOnboardingThunk,
} from '@store/settings-store';
import { AppDispatch } from '@store/store';
import { DEFAULT_START_DAY, OnboardingData } from '@api/models';
import { PercentTriple, Language, Currency, DEFAULT_PERCENTS, DEFAULT_LANGUAGE } from '@api/types';

import './multi-step-form.styles.scss';

export interface MultiStepFormData {
  percents: PercentTriple;
  startDay: number;
  language: Language;
  currency: Currency;
}

export interface MultiFormProp {
  formData: MultiStepFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export interface FormPercentsProp {
  formData: MultiStepFormData;
  onPercentsChange: (key: keyof PercentTriple, value: string | number) => void;
}

const MultiStepForm: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation('common');

  const user = useSelector(selectAuthUser);
  const status = useSelector(selectSettingsStatus);
  const { startDay, language, percents } = useSelector(selectOnboardingSettings);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<MultiStepFormData>({
    percents: percents ?? DEFAULT_PERCENTS,
    startDay: startDay ?? DEFAULT_START_DAY,
    language: language ?? DEFAULT_LANGUAGE,
    currency: 'EUR', // TODO
  });

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const num = name === 'startDay' ? Number(value.padStart(2, '0')) : value;

    setFormData((prev) => {
      return { ...prev, [name]: num };
    });
  };

  const handlePercentChange = (key: keyof PercentTriple, value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) || 0 : value;

    setFormData((prev) => ({
      ...prev,
      percents: {
        ...prev.percents,
        [key]: num,
      },
    }));
  };

  const getNextBtnDisabled = () => {
    if (
      step === 3 &&
      formData.percents.needs + formData.percents.wants + formData.percents.savings > 1
    )
      return true;
    if (step === 4 && (formData.startDay < 1 || formData.startDay > 28)) return true;
    return false;
  };

  const handleNextClick = async () => {
    if (step < 4) {
      nextStep();
      return;
    }
    if (!user?.uuid) return;
    const data: OnboardingData = {
      language: formData.language,
      currency: formData.currency,
      startDay: formData.startDay,
      percents: formData.percents,
    };

    await dispatch(completeOnboardingThunk({ uid: user.uuid, onboardingData: data })).unwrap();
    nextStep();
  };

  return (
    <div className="multi-step-container">
      <MultiStepProgressBar step={step} totalSteps={5} />
      <div className="step-container">
        {step === 1 && (
          <>
            <h1 className="step-header">
              {t('hi')} {user?.displayName} 👋
            </h1>
            <div className="step-content">
              <StepOne />
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <h1 className="step-header">{t('onboarding:step2.title')}</h1>
            <div className="step-content">
              <StepTwo formData={formData} onChange={handleChange} />
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <h1 className="step-header">{t('onboarding:step3.title')}</h1>
            <div className="step-content">
              <StepThree formData={formData} onPercentsChange={handlePercentChange} />
            </div>
          </>
        )}
        {step === 4 && (
          <>
            <h1 className="step-header">{t('onboarding:step4.title')}</h1>
            <div className="step-content">
              <StepFour formData={formData} onChange={handleChange} />
            </div>
          </>
        )}
        {step === 5 && (
          <>
            <h1 className="step-header">{t('onboarding:step5.title')}</h1>
            <div className="step-content">
              <StepFive />
            </div>
          </>
        )}
      </div>
      <div className="step-action-buttons">
        {step < 5 && (
          <Button
            htmlType="button"
            onClick={() => navigate('/')}
            buttonType="neutral"
            customContainerClass="skip-btn onboarding-btn"
          >
            <span>{t('actions.skip') ?? 'Skip'}</span>
          </Button>
        )}

        {step > 1 && step < 5 && (
          <Button
            htmlType="button"
            onClick={prevStep}
            buttonType="secondary"
            customContainerClass="onboarding-btn"
          >
            <span>{t('actions.back') ?? 'Back'}</span>
          </Button>
        )}
        {step !== 5 && (
          <Button
            htmlType="button"
            onClick={handleNextClick}
            buttonType="primary"
            isLoading={status === 'loading'}
            disabled={getNextBtnDisabled()}
            customContainerClass="onboarding-btn"
          >
            <span>{t('actions.next') ?? 'Next'}</span>
          </Button>
        )}

        {step === 5 && (
          <Button
            onClick={() => navigate('/')}
            htmlType="button"
            buttonType="primary"
            customContainerClass="onboarding-btn"
          >
            <span>{t('actions.continue') ?? 'Continue'}</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default MultiStepForm;
