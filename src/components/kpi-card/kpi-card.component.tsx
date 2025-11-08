import React from 'react';

import './kpi-card.styles.scss';

const KpiCard: React.FC<{
  title: string;
  value: string;
  tone?: 'danger' | 'success' | 'warn' | 'muted';
}> = ({ title, value, tone = 'muted' }) => (
  <div className={`kpi-card kpi-card__${tone}`}>
    <div className="kpi-title">{title}</div>
    <div className={`kpi-value kpi-value__${tone}`}>{value}</div>
  </div>
);

export default KpiCard;
