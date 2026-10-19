import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface PageHeaderProps {
  title: string;
  description?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  /** Alias for actions — some pages pass a single action object */
  action?: React.ReactNode | { label: string; onClick: () => void };
  breadcrumbs?: { label: string; href?: string }[];
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, subtitle, actions, action, breadcrumbs }) => {
  const resolvedSubtitle = subtitle ?? description;
  const resolvedActions = actions ?? (action ? (typeof action === 'object' && action !== null && 'label' in action ? null : action as React.ReactNode) : null);
  return (
    <div className="mb-6">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex mb-2" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-slate-500">
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <li key={index} className="flex items-center">
                  {crumb.href && !isLast ? (
                    <Link to={crumb.href} className="hover:text-indigo-600 transition-colors">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className={isLast ? 'text-slate-900 font-medium' : ''}>
                      {crumb.label}
                    </span>
                  )}
                  {!isLast && <ChevronRight className="w-4 h-4 mx-1" />}
                </li>
              );
            })}
          </ol>
        </nav>
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {resolvedSubtitle && <p className="mt-1 text-sm text-slate-500">{resolvedSubtitle}</p>}
        </div>
        {resolvedActions && <div className="mt-4 sm:mt-0 flex space-x-3">{resolvedActions}</div>}
      </div>
    </div>
  );
};
