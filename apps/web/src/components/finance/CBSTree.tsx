import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Folder, FileText, Lock, TrendingUp, AlertCircle } from 'lucide-react';

export interface CBSNode {
  id: string;
  code: string;
  name: string;
  level: number;
  originalBudget: number;
  baselineBudget: number;
  actualCost: number;
  commitments: number;
  forecastCost: number;
  children?: CBSNode[];
}

interface CBSTreeProps {
  nodes: CBSNode[];
  baselineRevision: string;
}

const formatCr = (val: number) => {
  if (Math.abs(val) >= 10000000) {
    return `₹${(val / 10000000).toFixed(2)}Cr`;
  }
  if (Math.abs(val) >= 100000) {
    return `₹${(val / 100000).toFixed(2)}L`;
  }
  return `₹${val.toLocaleString()}`;
};

export const CBSTree: React.FC<CBSTreeProps> = ({ nodes, baselineRevision }) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    'cbs-1': true,
    'cbs-2': true,
    'cbs-3': true,
  });

  const toggle = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderRow = (node: CBSNode) => {
    const isParent = Boolean(node.children && node.children.length > 0);
    const isExpanded = expanded[node.id];
    const variance = node.baselineBudget - node.actualCost;
    const variancePct = node.baselineBudget > 0 ? (variance / node.baselineBudget) * 100 : 0;
    const isOverbudget = node.actualCost + node.commitments > node.baselineBudget;

    return (
      <React.Fragment key={node.id}>
        <tr className={`border-b border-slate-100 transition-colors ${
          node.level === 1 ? 'bg-slate-50/80 font-semibold' : 'hover:bg-slate-50'
        }`}>
          <td className="py-2.5 px-4">
            <div className="flex items-center gap-1.5" style={{ paddingLeft: `${(node.level - 1) * 20}px` }}>
              {isParent ? (
                <button
                  type="button"
                  onClick={() => toggle(node.id)}
                  className="p-1 hover:bg-slate-200 rounded text-slate-500"
                >
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              ) : (
                <span className="w-5" />
              )}
              {isParent ? (
                <Folder className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              ) : (
                <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              )}
              <span className="font-mono text-xs text-indigo-600 font-bold">{node.code}</span>
              <span className="text-xs text-slate-800 ml-1">{node.name}</span>
            </div>
          </td>

          <td className="py-2.5 px-3 text-right text-xs text-slate-600">
            {formatCr(node.originalBudget)}
          </td>

          <td className="py-2.5 px-3 text-right text-xs font-semibold text-slate-800">
            {formatCr(node.baselineBudget)}
          </td>

          <td className="py-2.5 px-3 text-right text-xs text-slate-800">
            {formatCr(node.actualCost)}
          </td>

          <td className="py-2.5 px-3 text-right text-xs text-blue-600">
            {formatCr(node.commitments)}
          </td>

          <td className="py-2.5 px-3 text-right text-xs font-medium text-slate-700">
            {formatCr(node.forecastCost)}
          </td>

          <td className="py-2.5 px-3 text-right text-xs font-semibold">
            <span className={variance >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
              {variance > 0 ? '+' : ''}{formatCr(variance)}
            </span>
          </td>

          <td className="py-2.5 px-4 text-right text-xs">
            <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
              isOverbudget
                ? 'bg-rose-100 text-rose-700'
                : variancePct >= 0
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-amber-100 text-amber-700'
            }`}>
              {variancePct.toFixed(1)}%
            </span>
          </td>
        </tr>

        {isParent && isExpanded && node.children?.map(child => renderRow(child))}
      </React.Fragment>
    );
  };

  return (
    <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">Cost Breakdown Structure (CBS) Tree</span>
          <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 font-mono font-semibold text-[10px]">
            Locked Baseline: {baselineRevision}
          </span>
        </div>
        <div className="text-slate-400 text-[11px]">
          Hierarchy: Level 1 (Package) &gt; Level 2 (Sub-package) &gt; Level 3 (Cost Head)
        </div>
      </div>

      <table className="w-full text-left">
        <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 text-[11px] uppercase font-bold tracking-wider">
          <tr>
            <th className="py-2.5 px-4">CBS Code & Cost Description</th>
            <th className="py-2.5 px-3 text-right">Original Budget</th>
            <th className="py-2.5 px-3 text-right">Baseline Budget</th>
            <th className="py-2.5 px-3 text-right">Actual Cost (AC)</th>
            <th className="py-2.5 px-3 text-right">Open POs / Commit</th>
            <th className="py-2.5 px-3 text-right">Forecast (FAC)</th>
            <th className="py-2.5 px-3 text-right">Variance</th>
            <th className="py-2.5 px-4 text-right">Status</th>
          </tr>
        </thead>
        <tbody>
          {nodes.map(node => renderRow(node))}
        </tbody>
      </table>
    </div>
  );
};
export default CBSTree;
