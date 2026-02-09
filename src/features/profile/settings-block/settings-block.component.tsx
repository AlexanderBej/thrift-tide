import React from 'react';
import { useSelector } from 'react-redux';

import { selectSettingsAppTheme } from '@store/settings-store';

import './settings-block.styles.scss';

interface SettingsBlockProps {
  title: string;
  children: React.ReactNode | React.ReactNode[];
}

const SettingsBlock: React.FC<SettingsBlockProps> = ({ title, children }) => {
  const theme = useSelector(selectSettingsAppTheme);
  return (
    <section className="settings-block tt-section">
      <h5 className="tt-settings-header">{title}</h5>
      <div className={`settings-container settings-container__${theme}`}>{children}</div>
    </section>
  );
};

export default SettingsBlock;
