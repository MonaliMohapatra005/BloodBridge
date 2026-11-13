import React from 'react';
import { BloodGroup } from '../../lib/bloodCompatibility';
import { cn } from '../../lib/utils';
import { Droplet } from 'lucide-react';

interface BloodBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  bloodGroup: BloodGroup | string;
  size?: 'sm' | 'md' | 'lg';
  isCompatible?: boolean;
  showIcon?: boolean;
}

export const BloodBadge: React.FC<BloodBadgeProps> = ({
  bloodGroup,
  size = 'md',
  isCompatible,
  showIcon = true,
  className,
  ...props
}) => {
  const sizes = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5 font-semibold',
    lg: 'text-base px-3.5 py-1.5 gap-2 font-bold',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg border font-mono tracking-tight transition-all',
        isCompatible === true
          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-100'
          : isCompatible === false
          ? 'bg-slate-50 text-slate-500 border-slate-200 opacity-70'
          : 'bg-red-50 text-blood-700 border-red-200',
        sizes[size],
        className
      )}
      {...props}
    >
      {showIcon && (
        <Droplet
          className={cn(
            'fill-current',
            iconSizes[size],
            isCompatible === true ? 'text-emerald-600' : 'text-blood-700'
          )}
        />
      )}
      <span>{bloodGroup}</span>
      {isCompatible === true && (
        <span className="text-[10px] font-sans font-medium uppercase px-1 py-0.2 bg-emerald-200/60 rounded text-emerald-900 ml-0.5">
          Match
        </span>
      )}
    </div>
  );
};

