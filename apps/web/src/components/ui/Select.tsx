import React from 'react';
import clsx from 'clsx';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  error?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ options, error, className, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={clsx(
        "block w-full pl-3 pr-10 py-2 text-base border rounded-md focus:outline-none sm:text-sm transition-colors",
        error 
          ? "border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500" 
          : "border-slate-300 focus:ring-indigo-500 focus:border-indigo-500",
        className
      )}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
});

Select.displayName = 'Select';
