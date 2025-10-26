import React from 'react';
import { Badge } from '../../store/budget-store/budget-badges.selectors';

import './badge-pills.styles.scss';

export const BadgePills: React.FC<{ badges: Badge[]; onClickBadge?: (b: Badge) => void }> = ({
  badges,
  onClickBadge,
}) => {
  console.log('badges', badges);

  return (
    <div className="badge-row">
      {badges.map((b) => (
        <button
          key={b.id}
          className={`badge-pill ${b.kind}`}
          onClick={() => onClickBadge?.(b)}
          title={b.scope ? `Scope: ${b.scope}` : undefined}
          type="button"
        >
          {b.text}
        </button>
      ))}
    </div>
  );
};
