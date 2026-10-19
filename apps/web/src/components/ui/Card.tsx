import React from 'react';
import clsx from 'clsx';

export interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ title, subtitle, children, className, actions, onClick }) => {

  return (
    <div className={clsx("bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden", className)} onClick={onClick}>

      {(title || subtitle || actions) && (
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
          <div>
            {title && <h3 className="text-lg font-semibold text-slate-800">{title}</h3>}
            {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
          </div>
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};
