import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ReferenceLine, ResponsiveContainer
} from 'recharts';
import { SCurveDataPoint } from '../../types/deliverable';

interface SCurveProps {
  data: SCurveDataPoint[];
  title: string;
  category?: string;
  todayLabel?: string;
  height?: number;
}

const SCurve: React.FC<SCurveProps> = ({
  data,
  title,
  category,
  todayLabel,
  height = 320,
}) => {
  const todayIndex = todayLabel
    ? data.findIndex(d => d.period === todayLabel)
    : Math.floor(data.length * 0.55);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <div className="mb-3">
        <p className="text-sm font-semibold text-slate-700">{title}</p>
        {category && (
          <p className="text-xs text-slate-400">{category} Progress Curve</p>
        )}
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="period"
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
            width={42}
          />
          <Tooltip
            formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
          />
          {todayIndex >= 0 && (
            <ReferenceLine
              x={data[todayIndex]?.period}
              stroke="#94a3b8"
              strokeDasharray="4 4"
              label={{
                value: 'Today',
                position: 'insideTopRight',
                fontSize: 10,
                fill: '#94a3b8',
              }}
            />
          )}
          <Line
            type="monotone"
            dataKey="planned"
            name="Planned"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="actual"
            name="Actual"
            stroke="#22c55e"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="forecast"
            name="Forecast"
            stroke="#f97316"
            strokeWidth={2}
            strokeDasharray="5 3"
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SCurve;
