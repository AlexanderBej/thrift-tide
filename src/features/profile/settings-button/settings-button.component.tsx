import React from 'react';
import { FaChevronRight } from 'react-icons/fa';

import { TTIcon } from '@shared/ui';
import { getCssVar } from '@shared/utils';

import './settings-button.styles.scss';

interface SettingsButtonProps {
  title: React.ReactNode;
  value?: string;
  openSheet: () => void;
}

const SettingsButton: React.FC<SettingsButtonProps> = ({ title, value, openSheet }) => {
  return (
    <button className="settings-button" onClick={openSheet}>
      <div className="settings-label">{title}</div>
      <div className="settings-row-end">
        {value && <span className="settings-value">{value}</span>}
        <TTIcon icon={FaChevronRight} size={16} color={getCssVar('--color-text-primary')} />
      </div>
    </button>
  );
};

export default SettingsButton;
