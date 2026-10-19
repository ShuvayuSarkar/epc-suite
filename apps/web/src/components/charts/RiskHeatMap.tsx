import React, { useState, useMemo } from 'react';
import { Tooltip, ResponsiveContainer } from 'recharts';

interface RiskEntry {
  id: string;
  title: string;
  probability: 1 | 2 | 3 | 4 | 5;
  impact: 1 | 2 | 3 | 4 | 5;
}

interface RiskHeatMapProps {
  risks: RiskEntry[];
  onCellClick?: (probability: number, impact: number, risks: RiskEntry[]) => void;
}

type CellColor = 'green' | 'amber' | 'orange' | 'red';

function getCellColor(p: number, i: number): CellColor {
  const score = p * i;
  if (score <= 4) return 'green';
  if (score <= 9) return 'amber';
  if (score <= 14) return 'orange';
  return 'red';
}

const colorClasses: Record<CellColor, string> = {
  green:  'bg-green-100 hover:bg-green-200 border-green-300 text-green-800',
  amber:  'bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-800',
  orange: 'bg-orange-100 hover:bg-orange-200 border-orange-300 text-orange-800',
  red:    'bg-red-100 hover:bg-red-200 border-red-300 text-red-800',
};

const impactLabels = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
const probLabels   = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'];

const RiskHeatMap: React.FC<RiskHeatMapProps> = ({ risks, onCellClick }) => {
  const [selected, setSelected] = useState<{ p: number; i: number } | null>(null);

  // Build lookup: risk count per (p, i) cell
  const cellMap = useMemo(() => {
    const map: Record<string, RiskEntry[]> = {};
    for (const r of risks) {
      const key = `${r.probability}-${r.impact}`;
      if (!map[key]) map[key] = [];
      map[key].push(r);
    }
    return map;
  }, [risks]);

  const handleClick = (p: number, i: number) => {
    setSelected(prev => (prev?.p === p && prev?.i === i) ? null : { p, i });
    const key = `${p}-${i}`;
    onCellClick?.(p, i, cellMap[key] ?? []);
  };

  const selectedRisks = selected ? (cellMap[`${selected.p}-${selected.i}`] ?? []) : [];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <p className="text-sm font-semibold text-slate-700 mb-1">Risk Heat Map</p>
      <p className="text-xs text-slate-400 mb-4">Probability × Impact — Click a cell to see risks</p>

      <div className="flex gap-4">
        {/* Matrix */}
        <div className="flex-1">
          {/* Y-axis label */}
          <div className="flex items-start gap-2">
            <div className="flex flex-col justify-center items-center mr-1 mt-6">
              <span className="text-[10px] text-slate-500 font-medium rotate-[-90deg] whitespace-nowrap" style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)', height: 80 }}>
                PROBABILITY →
              </span>
            </div>
            <div className="flex-1">
              {/* Column headers (Impact) */}
              <div className="grid grid-cols-5 gap-1 mb-1 ml-14">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="text-center text-[10px] text-slate-500 font-medium">
                    {i}<br /><span className="text-[9px] font-normal">{impactLabels[i - 1]}</span>
                  </div>
                ))}
              </div>
              {/* Rows (Probability, high to low top to bottom) */}
              {[5, 4, 3, 2, 1].map(p => (
                <div key={p} className="grid grid-cols-5 gap-1 mb-1" style={{ gridTemplateColumns: '56px repeat(5, 1fr)' }}>
                  <div className="flex items-center justify-end pr-2 text-[9px] text-slate-500 text-right leading-tight">
                    {p}<br />{probLabels[p - 1]}
                  </div>
                  {[1, 2, 3, 4, 5].map(i => {
                    const key = `${p}-${i}`;
                    const count = cellMap[key]?.length ?? 0;
                    const color = getCellColor(p, i);
                    const isSelected = selected?.p === p && selected?.i === i;
                    return (
                      <button
                        key={i}
                        onClick={() => handleClick(p, i)}
                        className={`
                          rounded border flex items-center justify-center h-10 text-sm font-bold cursor-pointer transition-all
                          ${colorClasses[color]}
                          ${isSelected ? 'ring-2 ring-offset-1 ring-slate-600' : ''}
                        `}
                        title={`P${p} × I${i} = Score ${p * i} | ${count} risk(s)`}
                      >
                        {count > 0 ? count : ''}
                      </button>
                    );
                  })}
                </div>
              ))}
              {/* X-axis label */}
              <div className="text-center text-[10px] text-slate-500 font-medium mt-2 ml-14">
                ← IMPACT →
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2 min-w-[110px]">
          <p className="text-[10px] font-semibold text-slate-500 uppercase">Legend</p>
          {(['green', 'amber', 'orange', 'red'] as CellColor[]).map(c => (
            <div key={c} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded border ${colorClasses[c].split(' ')[0]} ${colorClasses[c].split(' ')[2]}`} />
              <span className="text-[10px] text-slate-600 capitalize">
                {c === 'green' ? 'Low (1–4)' : c === 'amber' ? 'Medium (5–9)' : c === 'orange' ? 'High (10–14)' : 'Critical (15–25)'}
              </span>
            </div>
          ))}
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-[10px] font-semibold text-slate-500 uppercase mb-1">Totals</p>
            {(['red', 'orange', 'amber', 'green'] as CellColor[]).map(c => {
              const count = Object.entries(cellMap).filter(([key]) => {
                const [p, i] = key.split('-').map(Number);
                return getCellColor(p, i) === c;
              }).reduce((sum, [, arr]) => sum + arr.length, 0);
              return (
                <div key={c} className="flex justify-between text-[10px] text-slate-600 capitalize mb-0.5">
                  <span>{c === 'green' ? 'Low' : c === 'amber' ? 'Med' : c === 'orange' ? 'High' : 'Critical'}</span>
                  <span className="font-bold">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Cell Risks */}
      {selected && selectedRisks.length > 0 && (
        <div className="mt-4 border-t border-slate-100 pt-3">
          <p className="text-xs font-semibold text-slate-600 mb-2">
            Risks at P{selected.p} × I{selected.i} (Score: {selected.p * selected.i})
          </p>
          <ul className="space-y-1">
            {selectedRisks.map(r => (
              <li key={r.id} className="text-xs text-slate-700 flex items-start gap-2">
                <span className="text-slate-400">•</span>
                {r.title}
              </li>
            ))}
          </ul>
        </div>
      )}
      {selected && selectedRisks.length === 0 && (
        <div className="mt-4 border-t border-slate-100 pt-3">
          <p className="text-xs text-slate-400">No risks in this cell.</p>
        </div>
      )}
    </div>
  );
};

export default RiskHeatMap;
