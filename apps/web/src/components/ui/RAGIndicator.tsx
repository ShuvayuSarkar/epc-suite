import React from 'react';
import clsx from 'clsx';

export interface RAGIndicatorProps {
  status: 'RED' | 'AMBER' | 'GREEN' | 'red' | 'amber' | 'green';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const colorMap: Record<string, string> = {
  RED: 'bg-red-500',
  AMBER: 'bg-amber-500',
  GREEN: 'bg-green-500',
  red: 'bg-red-500',
  amber: 'bg-amber-500',
  green: 'bg-green-500',
};

const sizeMap = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
};

export const RAGIndicator: React.FC<RAGIndicatorProps> = ({ status, label, size = 'md' }) => {
  return (
    <div className="flex items-center space-x-2">
      <div className={clsx("rounded-full", colorMap[status] ?? 'bg-slate-400', sizeMap[size])} />
      {label && <span className="text-sm font-medium text-slate-700">{label}</span>}
    </div>
  );
};
