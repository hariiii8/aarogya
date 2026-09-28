import { AlertCircle, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import React from 'react';
import { RiskLevel } from '../types';

interface RiskBadgeProps {
  risk: RiskLevel;
  percentage?: number;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  risk,
  percentage,
  size = 'md',
  showPercentage = true,
}) => {
  // Exact Risk System mapping:
  // Green = Low
  // Grey-olive = Moderate
  // Amber = Watch
  // Red = High
  const config = {
    Low: {
      label: 'Low Risk',
      bgColor: 'bg-emerald-100/90 text-emerald-800 border-emerald-300',
      iconColor: 'text-emerald-700',
      dotColor: 'bg-emerald-600',
      icon: CheckCircle2,
    },
    Moderate: {
      label: 'Moderate',
      // Grey-olive as specified in prompt
      bgColor: 'bg-[#EAEBE4] text-[#484E3C] border-[#B8BEA9]',
      iconColor: 'text-[#5B634D]',
      dotColor: 'bg-[#677054]',
      icon: AlertCircle,
    },
    Watch: {
      label: 'Watch',
      bgColor: 'bg-amber-100 text-amber-800 border-amber-300',
      iconColor: 'text-amber-700',
      dotColor: 'bg-amber-600',
      icon: AlertTriangle,
    },
    High: {
      label: 'High Risk',
      bgColor: 'bg-rose-100 text-rose-800 border-rose-300',
      iconColor: 'text-rose-700',
      dotColor: 'bg-rose-600',
      icon: ShieldAlert,
    },
  }[risk];

  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1 font-semibold rounded-full border',
    md: 'px-2.5 py-1 text-xs gap-1.5 font-semibold rounded-full border',
    lg: 'px-3 py-1.5 text-sm gap-2 font-semibold rounded-full border shadow-xs',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  return (
    <span
      id={`risk-badge-${risk.toLowerCase()}`}
      className={`inline-flex items-center tracking-tight ${sizeClasses} ${config.bgColor}`}
    >
      <IconComponent className={`${iconSizes} ${config.iconColor} shrink-0`} />
      <span>{config.label}</span>
      {showPercentage && percentage !== undefined && (
        <span className="font-extrabold text-[11px] ml-0.5 tracking-tight">
          ({percentage}%)
        </span>
      )}
    </span>
  );
};
