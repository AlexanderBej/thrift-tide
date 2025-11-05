import React from 'react';
import clsx from 'clsx';

import './multi-step-progress-bar.styles.scss';

interface MultiStepProgressBarProps {
  step: number;
  totalSteps: number;
}

const MultiStepProgressBar: React.FC<MultiStepProgressBarProps> = ({ step, totalSteps }) => {
  const getContainerClass = (index: number) => {
    return clsx('progress-tab', {
      'progress-tab__selected': index < step,
    });
  };

  return (
    <div className="multi-step-progress-bar">
      {Array.from({ length: totalSteps }, (_, index) => (
        <div key={index} className={getContainerClass(index)} />
      ))}
    </div>
  );
};

export default MultiStepProgressBar;
