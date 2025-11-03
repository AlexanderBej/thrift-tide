import React from 'react';

import './multi-step-progress-bar.styles.scss';

interface MultiStepProgressBarProps {
  step: number;
  totalSteps: number;
}

const MultiStepProgressBar: React.FC<MultiStepProgressBarProps> = ({ step, totalSteps }) => {
  const progress = (step / totalSteps) * 100;
  return (
    <div className="multi-step-progress-bar">
      {Array.from({ length: totalSteps }, (_, index) => (
        <div key={index} className={`progress-tab ${index < step ? 'progress-tab__selected' : ''}`} />
      ))}
    </div>
  );
};

export default MultiStepProgressBar;