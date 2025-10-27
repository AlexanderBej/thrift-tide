import React from 'react';

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
          background: progress >= 1 ? '#ef4444' : '#22c55e',
        }}
      />
    </div>
  );
};

export default ProgressBar;
