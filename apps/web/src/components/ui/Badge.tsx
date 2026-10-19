import React from 'react';
import clsx from 'clsx';

export interface BadgeProps {
  label?: string;
  children?: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'default' | 'primary' | 'secondary' | 'outline';
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<string, string> = {
  success: 'bg-green-100 text-green-800',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  neutral: 'bg-slate-100 text-slate-800',
  default: 'bg-slate-100 text-slate-800',
  primary: 'bg-indigo-100 text-indigo-800',
  secondary: 'bg-slate-100 text-slate-600',
  outline: 'bg-white text-slate-700 border border-slate-300',
};

const dotColors: Record<string, string> = {
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
  neutral: 'bg-slate-500',
  default: 'bg-slate-500',
  primary: 'bg-indigo-500',
  secondary: 'bg-slate-400',
  outline: 'bg-slate-400',
};

export const Badge: React.FC<BadgeProps> = ({ label, children, variant = 'neutral', dot, className }) => {
  const displayText = label ?? children;
  return (
    <span className={clsx(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
      variantStyles[variant] ?? variantStyles.neutral,
      className
    )}>
      {dot && (
        <span className={clsx("-ml-0.5 mr-1.5 h-2 w-2 rounded-full", dotColors[variant] ?? dotColors.neutral)} />
      )}
      {displayText}
    </span>
  );
};
