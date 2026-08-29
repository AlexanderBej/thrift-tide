import React from 'react';
import { FiChevronRight } from 'react-icons/fi';
import clsx from 'clsx';

import { Category } from '@api/types';
import { TTIcon } from '@shared/ui';

import './selector-row.styles.scss';

interface SelectorRowProps {
  label: string;
  value: string;
  meta?: string;
  icon?: any;
  labelColor?: string;
  category?: Category;
  error?: string;
  variant?: 'group' | 'date';
  onClick: () => void;
}

const SelectorRow: React.FC<SelectorRowProps> = ({
  label,
  value,
  meta,
  icon,
  labelColor,
  category,
  error,
  variant = 'date',
  onClick,
}) => (
  <div>
    <button
      type="button"
      className={clsx('capture-selector-row', `capture-selector-row--${variant}`, {
        'capture-selector-row--empty': !icon && variant === 'group',
        [`capture-selector-row--${category}`]: !!category,
      })}
      onClick={onClick}
    >
      <span className="capture-selector-main">
        {icon && (
          <span
            className={clsx(
              'capture-selector-icon',
              category && `capture-selector-icon--${category}`,
            )}
          >
            <TTIcon icon={icon} color={'var(--color-text-primary)'} size={18} />
          </span>
        )}
        <span className="capture-selector-copy">
          <small>{label}</small>
          <strong style={{ color: labelColor ?? 'var(--color-text-primary)' }}>{value}</strong>
        </span>
        <span className="capture-selector-chevron" aria-hidden="true">
          <TTIcon icon={FiChevronRight} color="var(--color-text-muted)" size={20} />
        </span>
      </span>
      {variant === 'group' && category && meta && (
        <span className="capture-selector-category">
          <i aria-hidden="true" />
          <em>{meta}</em>
        </span>
      )}
      {variant !== 'group' && meta && <em className="capture-selector-meta">{meta}</em>}
    </button>
    {error && <p className="capture-field-error">{error}</p>}
  </div>
);

export default SelectorRow;
