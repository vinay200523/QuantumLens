import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: string;
  color?: 'blue' | 'emerald' | 'amber' | 'slate' | 'purple';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'blue',
}) => {
  const colorStyles = {
    blue: 'border-blue-100 bg-blue-50/40 text-blue-700',
    emerald: 'border-emerald-100 bg-emerald-50/40 text-emerald-700',
    amber: 'border-amber-100 bg-amber-50/40 text-amber-700',
    slate: 'border-slate-200 bg-slate-50 text-slate-700',
    purple: 'border-purple-100 bg-purple-50/40 text-purple-700',
  };

  return (
    <div className="academic-card p-5 hover:border-slate-300">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
        {icon && (
          <div className={`p-2 rounded-lg border ${colorStyles[color]}`}>
            {icon}
          </div>
        )}
      </div>
      <div className="mt-2 flex items-baseline space-x-2">
        <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
        {trend && (
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
            {trend}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mt-1 text-xs text-slate-500 font-normal leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
};
