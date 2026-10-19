import React from 'react';
import clsx from 'clsx';

export interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  description?: string;
}

export const FormField: React.FC<FormFieldProps> = ({ label, error, required, children, className, description }) => {
  return (
    <div className={clsx("mb-4", className)}>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {description && <p className="text-xs text-slate-500 mb-2">{description}</p>}
      {children}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
