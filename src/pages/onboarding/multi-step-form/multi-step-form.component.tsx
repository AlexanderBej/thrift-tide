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
import { Pressable } from '@shared/ui';
import { selectAuthUser } from '@store/auth-store';
import {
  selectOnboardingSettings,
  completeOnboardingThunk,
  selectSettingsAppTheme,
} from '@store/settings-store';
import { AppDispatch } from '@store/store';
import { DEFAULT_START_DAY, OnboardingData } from '@api/models';
import {
  PercentTriple,
  Language,
  Currency,
  DEFAULT_PERCENTS,
  DEFAULT_LANGUAGE,
  Category,
} from '@api/types';
import { ReactComponent as Logo } from '../../../assets/logo.svg';

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

export interface MultiNonFormProp {
  formData: MultiStepFormData;
  setFormData: React.Dispatch<React.SetStateAction<MultiStepFormData>>;
}

export interface FormPercentsProp {
  formData: MultiStepFormData;
  onPercentsChange: (key: Category, value: string | number) => void;
}

const MultiStepForm: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation('common');

  const user = useSelector(selectAuthUser);
  const { startDay, language, percents, currency } = useSelector(selectOnboardingSettings);
  const theme = useSelector(selectSettingsAppTheme);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<MultiStepFormData>({
    percents: percents ?? DEFAULT_PERCENTS,
    startDay: startDay ?? DEFAULT_START_DAY,
    language: language ?? DEFAULT_LANGUAGE,
    currency: currency,
  });

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

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
    <div className={`multi-step-container multi-step-container__${theme}`}>
      <MultiStepProgressBar step={step} totalSteps={5} />
      <div className="step-container">
        {step === 1 && (
          <>
            <Logo height={100} />

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
              <StepTwo formData={formData} setFormData={setFormData} />
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <h1 className="step-header">{t('onboarding:step3.title')}</h1>
            <div className="step-content">
              <StepThree formData={formData} setFormData={setFormData} />
            </div>
          </>
        )}
        {step === 4 && (
          <>
            <h1 className="step-header">{t('onboarding:step4.title')}</h1>
            <div className="step-content">
              <StepFour formData={formData} setFormData={setFormData} />
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
          <Pressable
            haptic="medium"
            ripple={true}
            onClick={() => navigate('/')}
            className="skip-btn onboarding-btn"
            variant="neutral"
          >
            <span>{t('actions.skip') ?? 'Skip'}</span>
          </Pressable>
        )}

        {step > 1 && step < 5 && (
          <Pressable
            haptic="medium"
            ripple={true}
            onClick={prevStep}
            className="onboarding-btn"
            variant="secondary"
          >
            <span>{t('actions.back') ?? 'Back'}</span>
          </Pressable>
        )}
        {step !== 5 && (
          <Pressable
            haptic="medium"
            ripple={true}
            onClick={handleNextClick}
            disabled={getNextBtnDisabled()}
            className="onboarding-btn"
            variant="primary"
          >
            <span>{t('actions.next') ?? 'Next'}</span>
          </Pressable>
        )}

        {step === 5 && (
          <Pressable
            haptic="medium"
            ripple={true}
            variant="primary"
            onClick={() => navigate('/')}
            className="onboarding-btn"
          >
            <span>{t('actions.continue') ?? 'Continue'}</span>
          </Pressable>
        )}
      </div>
    </div>
  );
};

export default MultiStepForm;
