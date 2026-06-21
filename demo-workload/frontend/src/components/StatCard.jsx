import React from 'react';

export default function StatCard({ title, value, subtitle, icon, status = 'neutral' }) {
  const statusColors = {
    success: 'border-emerald-800/50 bg-emerald-950/30',
    warning: 'border-amber-800/50 bg-amber-950/30',
    danger: 'border-red-800/50 bg-red-950/30',
    neutral: 'border-slate-800',
  };

  const valueColors = {
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    danger: 'text-red-400',
    neutral: 'text-slate-100',
  };

  return (
    <div className={`card ${statusColors[status]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className={`mt-2 text-2xl font-bold ${valueColors[status]}`}>{value}</p>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
        </div>
        {icon && <div className="text-2xl opacity-80">{icon}</div>}
      </div>
    </div>
  );
}
