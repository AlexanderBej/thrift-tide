import React from 'react';

import './settings-block.styles.scss';

interface SettingsBlockProps {
  title: string;
  children: React.ReactNode | React.ReactNode[];
}

const SettingsBlock: React.FC<SettingsBlockProps> = ({ title, children }) => {
  return (
    <section className="settings-block tt-section">
      <h5 className="tt-settings-header">{title}</h5>
      <div className="settings-container">{children}</div>
    </section>
  );
};

export default SettingsBlock;
