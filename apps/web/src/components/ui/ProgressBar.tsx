import React from 'react';
import clsx from 'clsx';

export interface ProgressBarProps {
  progress: number;
  label?: string;
  showValue?: boolean;
  color?: 'indigo' | 'green' | 'amber' | 'red';
  size?: 'sm' | 'md';
}

const colorMap = {
  indigo: 'bg-indigo-600',
  green: 'bg-green-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
};

const heightMap = {
  sm: 'h-1.5',
  md: 'h-2.5',
};

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, label, showValue = true, color = 'indigo', size = 'md' 
}) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  
  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-xs font-medium text-slate-500">{label}</span>}
          {showValue && <span className="text-xs font-medium text-slate-700">{clampedProgress.toFixed(0)}%</span>}
        </div>
      )}
      <div className={clsx("w-full bg-slate-200 rounded-full overflow-hidden", heightMap[size])}>
        <div 
          className={clsx("h-full rounded-full transition-all duration-300", colorMap[color])} 
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};
