import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  iconColor = 'text-blood-700',
  iconBg = 'bg-red-50',
  className,
}) => {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-card hover:shadow-card-hover transition-all duration-200 flex items-center justify-between',
        className
      )}
    >
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="text-2xl sm:text-3xl font-extrabold text-[#17212B] tracking-tight">{value}</p>
        {subtext && <p className="text-xs text-[#73808C]">{subtext}</p>}
      </div>
      <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm', iconBg)}>
        <Icon className={cn('w-6 h-6', iconColor)} />
      </div>
    </div>
  );
};

