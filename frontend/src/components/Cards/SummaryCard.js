import React from 'react';
import './SummaryCard.css';

const SummaryCard = ({ title, value, subtitle, icon: Icon, highlight }) => {
  return (
    <div className={`summary-card ${highlight ? 'highlight' : ''}`}>
      {Icon && <Icon className="card-icon" />}
      <h3>{title}</h3>
      <div className="value">{value}</div>
      {subtitle && <div className="subtitle">{subtitle}</div>}
    </div>
  );
};

export default SummaryCard;