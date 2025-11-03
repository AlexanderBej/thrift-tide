import React from 'react';
import { useSelector } from 'react-redux';

import MultiStepForm from './multi-step-form/multi-step-form.component';
import CountdownRedirect from './countdown-redirect/countdown-redirect.component';
import { selectSettingOnboardingState } from '../../store/settings-store/settings.selectors';

import './onboarding.styles.scss';

const Onboarding: React.FC = () => {
  const onboardingCompleted = useSelector(selectSettingOnboardingState);

  return (
    <div className="onboarding-page">
      {!onboardingCompleted ? <MultiStepForm /> : <CountdownRedirect />}
    </div>
  );
};

export default Onboarding;
