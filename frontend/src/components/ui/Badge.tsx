import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
    | 'critical'
    | 'urgent'
    | 'scheduled'
    | 'broadcasting'
    | 'pooling'
    | 'fulfilled'
    | 'cancelled'
    | 'primary'
    | 'backup'
    | 'en_route'
    | 'arrived'
    | 'donated'
    | 'withdrawn'
    | 'outline';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full tracking-wide';

  const variants = {
    default: 'bg-slate-100 text-slate-700',
    critical: 'bg-red-50 text-blood-700 border border-red-200 font-semibold',
    urgent: 'bg-amber-50 text-amber-800 border border-amber-200 font-semibold',
    scheduled: 'bg-blue-50 text-blue-700 border border-blue-200',
    broadcasting: 'bg-red-100 text-blood-800 animate-pulse font-semibold',
    pooling: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    fulfilled: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    cancelled: 'bg-slate-100 text-slate-500 border border-slate-200 line-through',
    primary: 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold',
    backup: 'bg-purple-100 text-purple-800 border border-purple-200',
    en_route: 'bg-blue-100 text-blue-800 border border-blue-300',
    arrived: 'bg-teal-100 text-teal-800 border border-teal-300 font-semibold',
    donated: 'bg-emerald-600 text-white font-semibold',
    withdrawn: 'bg-gray-100 text-gray-500 line-through',
    outline: 'border border-slate-200 text-slate-600 bg-white',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
};

