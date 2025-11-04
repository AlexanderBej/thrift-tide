import React from 'react';

import MultiStepForm from './multi-step-form/multi-step-form.component';

import './onboarding.styles.scss';

const Onboarding: React.FC = () => {
  return (
    <div className="onboarding-page">
      <MultiStepForm />
    </div>
  );
};

export default Onboarding;
