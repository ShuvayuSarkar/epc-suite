import React from 'react';
import clsx from 'clsx';

export interface Tab {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab?: string;
  /** Alias for activeTab */
  activeId?: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, activeId, onChange, className }) => {
  const resolvedActive = activeTab ?? activeId ?? tabs[0]?.id ?? '';
  return (
    <div className={clsx("border-b border-slate-200", className)}>
      <nav className="-mb-px flex space-x-8 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={clsx(
              "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center",
              resolvedActive === tab.id
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            )}
          >
            {tab.icon && <span className="mr-2">{tab.icon}</span>}
            {tab.label}
            {tab.count !== undefined && (
              <span className={clsx(
                "ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium",
                resolvedActive === tab.id ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-900"
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};
