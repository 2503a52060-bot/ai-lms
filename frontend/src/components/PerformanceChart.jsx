import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: '#1e293b',
          color: '#ffffff',
          padding: '0.6rem 0.9rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          fontSize: '0.8rem',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <p style={{ fontWeight: 600, marginBottom: '0.35rem', color: '#94a3b8' }}>{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: entry.color }} />
            <span>{entry.name}:</span>
            <span style={{ fontWeight: 700, color: '#f8fafc' }}>
              {entry.value}
              {typeof entry.value === 'number' && entry.name.toLowerCase().includes('score') ? '%' : ''}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const PerformanceChart = ({
  type = 'area',
  data = [],
  dataKeys = [{ key: 'studentScore', name: 'My Score', color: '#4f46e5' }],
  xAxisKey = 'month',
  height = 300,
  radarPolarKey = 'subject',
  showGrid = true,
  showLegend = true
}) => {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        No chart data available
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        {type === 'area' && (
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              {dataKeys.map((item, idx) => (
                <linearGradient key={`grad-${idx}`} id={`color-${item.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={item.color || '#4f46e5'} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={item.color || '#4f46e5'} stopOpacity={0.0} />
                </linearGradient>
              ))}
            </defs>
            {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />}
            <XAxis dataKey={xAxisKey} tick={{ fill: '#64748b', fontSize: 12 }} stroke="#cbd5e1" />
            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} stroke="#cbd5e1" domain={[40, 100]} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend verticalAlign="top" height={36} />}
            {dataKeys.map((item) => (
              <Area
                key={item.key}
                type="monotone"
                dataKey={item.key}
                name={item.name || item.key}
                stroke={item.color || '#4f46e5'}
                strokeWidth={2.5}
                fillOpacity={1}
                fill={`url(#color-${item.key})`}
              />
            ))}
          </AreaChart>
        )}

        {type === 'bar' && (
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />}
            <XAxis dataKey={xAxisKey} tick={{ fill: '#64748b', fontSize: 12 }} stroke="#cbd5e1" />
            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} stroke="#cbd5e1" domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend verticalAlign="top" height={36} />}
            {dataKeys.map((item) => (
              <Bar
                key={item.key}
                dataKey={item.key}
                name={item.name || item.key}
                fill={item.color || '#4f46e5'}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        )}

        {type === 'line' && (
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />}
            <XAxis dataKey={xAxisKey} tick={{ fill: '#64748b', fontSize: 12 }} stroke="#cbd5e1" />
            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} stroke="#cbd5e1" domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend verticalAlign="top" height={36} />}
            {dataKeys.map((item) => (
              <Line
                key={item.key}
                type="monotone"
                dataKey={item.key}
                name={item.name || item.key}
                stroke={item.color || '#4f46e5'}
                strokeWidth={2.5}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        )}

        {type === 'radar' && (
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey={radarPolarKey} tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" />
            {dataKeys.map((item) => (
              <Radar
                key={item.key}
                name={item.name || item.key}
                dataKey={item.key}
                stroke={item.color || '#4f46e5'}
                fill={item.color || '#4f46e5'}
                fillOpacity={0.35}
              />
            ))}
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend verticalAlign="bottom" height={36} />}
          </RadarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceChart;
