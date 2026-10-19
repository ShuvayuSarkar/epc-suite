import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ReferenceLine, ResponsiveContainer, BarChart, Bar
} from 'recharts';

interface EVMDataPoint {
  period: string;
  pv: number;    // Planned Value (BCWS)
  ev: number;    // Earned Value (BCWP)
  ac: number;    // Actual Cost (ACWP)
}

interface EarnedValueCurveProps {
  data: EVMDataPoint[];
  bac: number;   // Budget at Completion
  height?: number;
}

function computeKPIs(data: EVMDataPoint[], bac: number) {
  const last = data.filter(d => d.ev > 0).slice(-1)[0];
  if (!last) return { cpi: 1, spi: 1, eac: bac, etc: bac, sv: 0, cv: 0 };
  const cpi = last.ac > 0 ? last.ev / last.ac : 1;
  const spi = last.pv > 0 ? last.ev / last.pv : 1;
  const eac = cpi > 0 ? bac / cpi : bac;
  const etc = eac - last.ac;
  const sv = last.ev - last.pv;
  const cv = last.ev - last.ac;
  return { cpi, spi, eac, etc, sv, cv };
}

const kpiColor = (v: number, threshold = 1) =>
  v >= threshold ? 'text-green-600' : v >= threshold * 0.9 ? 'text-amber-600' : 'text-red-600';
const kpiBg = (v: number, threshold = 1) =>
  v >= threshold ? 'bg-green-50 border-green-200' : v >= threshold * 0.9 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200';

const EarnedValueCurve: React.FC<EarnedValueCurveProps> = ({ data, bac, height = 300 }) => {
  const { cpi, spi, eac, sv, cv } = computeKPIs(data, bac);

  const fmt = (n: number) =>
    n >= 1e7 ? `₹${(n / 1e7).toFixed(1)}Cr` : n >= 1e5 ? `₹${(n / 1e5).toFixed(1)}L` : `₹${n.toFixed(0)}`;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <p className="text-sm font-semibold text-slate-700 mb-3">Earned Value Analysis</p>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className={`rounded-lg border p-3 ${kpiBg(cpi)}`}>
          <p className="text-xs text-slate-500">CPI (Cost)</p>
          <p className={`text-xl font-bold ${kpiColor(cpi)}`}>{cpi.toFixed(2)}</p>
          <p className="text-[10px] text-slate-400">{cpi >= 1 ? 'Under Budget' : 'Over Budget'}</p>
        </div>
        <div className={`rounded-lg border p-3 ${kpiBg(spi)}`}>
          <p className="text-xs text-slate-500">SPI (Schedule)</p>
          <p className={`text-xl font-bold ${kpiColor(spi)}`}>{spi.toFixed(2)}</p>
          <p className="text-[10px] text-slate-400">{spi >= 1 ? 'Ahead of Schedule' : 'Behind Schedule'}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs text-slate-500">EAC (Forecast Total)</p>
          <p className="text-lg font-bold text-slate-700">{fmt(eac)}</p>
          <p className="text-[10px] text-slate-400">BAC: {fmt(bac)}</p>
        </div>
        <div className={`rounded-lg border p-3 ${cv >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <p className="text-xs text-slate-500">Cost Variance</p>
          <p className={`text-lg font-bold ${cv >= 0 ? 'text-green-600' : 'text-red-600'}`}>{cv >= 0 ? '+' : ''}{fmt(cv)}</p>
          <p className="text-[10px] text-slate-400">SV: {sv >= 0 ? '+' : ''}{fmt(sv)}</p>
        </div>
      </div>

      {/* EVM Curve */}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
          <YAxis tickFormatter={fmt} tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} width={55} />
          <Tooltip
            formatter={(value: number, name: string) => [fmt(value), name]}
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
          <Line type="monotone" dataKey="pv" name="Planned Value (PV)" stroke="#3b82f6" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="ev" name="Earned Value (EV)" stroke="#22c55e" strokeWidth={2.5} dot={false} />
          <Line type="monotone" dataKey="ac" name="Actual Cost (AC)" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 3" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EarnedValueCurve;
