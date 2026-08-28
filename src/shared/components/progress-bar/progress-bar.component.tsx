import React from 'react';

import './progress-bar.styles.scss';

interface ProgressBarProps {
  progress: number;
  color?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = 'var(--color-primary)',
}) => {
  return (
    <div className="progress-bar">
      <div
        className="progress-bar-progress"
        style={{
          width: `${progress * 100}%`,
          background: progress >= 1 ? 'var(--color-error)' : color,
        }}
      />
    </div>
  );
};

export default ProgressBar;
