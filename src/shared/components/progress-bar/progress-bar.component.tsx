import React from 'react';

import { getCssVar } from '@shared/utils';

import './progress-bar.styles.scss';

interface ProgressBarProps {
  progress: number;
  color?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = getCssVar('--color-primary'),
}) => {
  return (
    <div className="progress-bar">
      <div
        className="progress-bar-progress"
        style={{
          width: `${progress * 100}%`,
          background: progress >= 1 ? getCssVar('--error') : color,
        }}
      />
    </div>
  );
};

export default ProgressBar;
