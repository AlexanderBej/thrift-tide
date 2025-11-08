import React from 'react';

import { getCssVar } from '@shared/utils';

import './progress-bar.styles.scss';

interface ProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <div className="progress-bar">
      <div
        className="progress-bar-progress"
        style={{
          width: `${progress * 100}%`,
          background: progress >= 1 ? getCssVar('--color-bg-main') : getCssVar('--color-primary'),
        }}
      />
    </div>
  );
};

export default ProgressBar;
