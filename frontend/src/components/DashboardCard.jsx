import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const DashboardCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendType = 'up',
  color = 'primary',
  onClick = null
}) => {
  return (
    <div
      className={`stat-card ${color}`}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      <div className="stat-content">
        <span className="stat-label">{title}</span>
        <div className="stat-value">{value}</div>

        {(trend || subtitle) && (
          <div className="stat-footer">
            {trend && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                  fontWeight: 700,
                  fontSize: '0.785rem',
                  color: trendType === 'up' ? 'var(--success)' : trendType === 'down' ? 'var(--danger)' : 'var(--text-muted)'
                }}
              >
                {trendType === 'up' && <TrendingUp size={14} />}
                {trendType === 'down' && <TrendingDown size={14} />}
                {trend}
              </span>
            )}
            {subtitle && (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                {subtitle}
              </span>
            )}
          </div>
        )}
      </div>

      {Icon && (
        <div className={`stat-icon ${color}`}>
          <Icon size={22} />
        </div>
      )}
    </div>
  );
};

export default DashboardCard;
