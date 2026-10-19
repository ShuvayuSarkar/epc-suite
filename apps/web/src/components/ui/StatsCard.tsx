import React from 'react';
import { Card } from './Card';
import clsx from 'clsx';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface StatsCardProps {
  title: string;
  value: string | number;
  /** Legacy prop — trend text like "+3 this month" */
  trend?: string;
  /** Legacy prop — true = positive, false = negative */
  trendPositive?: boolean;
  /** Preferred prop — change text */
  change?: string;
  /** Preferred prop — semantic type */
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  color?: 'indigo' | 'green' | 'amber' | 'red' | 'blue';
}

const colorMap = {
  indigo: 'bg-indigo-50 text-indigo-600',
  green: 'bg-green-50 text-green-600',
  amber: 'bg-amber-50 text-amber-600',
  red: 'bg-red-50 text-red-600',
  blue: 'bg-blue-50 text-blue-600',
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title, value, trend, trendPositive, change, changeType, icon, color = 'indigo'
}) => {
  // Normalize: support both `trend`/`trendPositive` and `change`/`changeType`
  const displayChange = change ?? trend;
  const displayType = changeType ?? (trendPositive === true ? 'positive' : trendPositive === false ? 'negative' : 'neutral');

  return (
    <Card className="flex flex-col justify-center">
      <div className="flex items-center">
        <div className={clsx("p-3 rounded-full mr-4 shrink-0", colorMap[color])}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500 truncate">{title}</p>
          <div className="flex items-baseline mt-1">
            <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
            {displayChange && (
              <span className={clsx(
                "ml-2 text-sm font-medium flex items-center",
                displayType === 'positive' && "text-green-600",
                displayType === 'negative' && "text-red-600",
                displayType === 'neutral' && "text-slate-500"
              )}>
                {displayType === 'positive' && <TrendingUp className="w-3 h-3 mr-1" />}
                {displayType === 'negative' && <TrendingDown className="w-3 h-3 mr-1" />}
                {displayType === 'neutral' && <Minus className="w-3 h-3 mr-1" />}
                {displayChange}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
