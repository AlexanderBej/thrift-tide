import React from 'react';

import './local-spinner.styles.scss';

const LocalSpinner: React.FC = () => (
  <div className="local-spinner">
    <div className="lds-dual-ring" />
  </div>
);

export default LocalSpinner;
