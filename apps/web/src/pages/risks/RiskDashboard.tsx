import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatsCard } from '../../components/ui/StatsCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { AlertTriangle, Shield, CheckCircle, Activity, Filter } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import RiskHeatMap from '../../components/charts/RiskHeatMap';

interface ProjectRisk {
  id: string;
  project: string;
  title: string;
  probability: 1 | 2 | 3 | 4 | 5;
  impact: 1 | 2 | 3 | 4 | 5;
  status: 'Open' | 'Mitigating' | 'Monitoring' | 'Closed';
  owner: string;
  mitigationPlan: string;
}

const MOCK_RISKS: ProjectRisk[] = [];

const riskTrendData = [
  { month: 'Jan', High: 15, Medium: 25, Low: 40 },
  { month: 'Feb', High: 18, Medium: 22, Low: 38 },
  { month: 'Mar', High: 14, Medium: 28, Low: 35 },
  { month: 'Apr', High: 12, Medium: 24, Low: 42 },
  { month: 'May', High: 9, Medium: 20, Low: 45 },
  { month: 'Jun', High: 8, Medium: 18, Low: 30 },
];

import { usePersistentState } from '../../hooks/usePersistentState';

export default function RiskDashboard() {
  const [risks, setRisks] = usePersistentState<ProjectRisk[]>('epc_risks', MOCK_RISKS);
  const [selectedCell, setSelectedCell] = useState<{ p: number; i: number } | null>(null);

  const filteredRisks = selectedCell
    ? risks.filter(r => r.probability === selectedCell.p && r.impact === selectedCell.i)
    : risks;

  const handleCellClick = (p: number, i: number) => {
    setSelectedCell(prev => (prev?.p === p && prev?.i === i ? null : { p, i }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Risk Register & 5x5 Heat Map"
        subtitle="Qualitative Probability x Impact analysis, mitigation tracking, and risk breakdown hierarchy"
      />

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Project Risks" value={String(risks.length)} icon={<Activity className="text-indigo-500" />} />
        <StatsCard
          title="Critical / High (Score ≥ 15)"
          value={String(risks.filter(r => r.probability * r.impact >= 15).length)}
          icon={<AlertTriangle className="text-rose-500" />}
          trend="Immediate mitigation required"
          trendPositive={false}
        />
        <StatsCard
          title="Active Mitigation"
          value={String(risks.filter(r => r.status === 'Mitigating').length)}
          icon={<Shield className="text-amber-500" />}
        />
        <StatsCard
          title="Under Monitoring"
          value={String(risks.filter(r => r.status === 'Monitoring').length)}
          icon={<CheckCircle className="text-emerald-500" />}
        />
      </div>

      {/* Heat Map & Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <RiskHeatMap
            risks={risks}
            onCellClick={handleCellClick}
          />
        </div>

        <Card className="p-4">
          <h3 className="text-sm font-bold text-slate-800 mb-2">Active Risk Trend by Severity</h3>
          <p className="text-xs text-slate-400 mb-4">Historical monthly trajectory of High vs Medium vs Low risks</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={riskTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" fontSize={11} />
                <YAxis fontSize={11} />
                <RechartsTooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="High" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Medium" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Low" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Filtered Risks Table */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            {selectedCell ? (
              <span>Filtered Risks at P{selectedCell.p} x I{selectedCell.i} ({filteredRisks.length})</span>
            ) : (
              <span>All Project Risks & Mitigation Action Plan ({risks.length})</span>
            )}
          </h3>
          {selectedCell && (
            <button
              onClick={() => setSelectedCell(null)}
              className="text-xs text-indigo-600 font-semibold hover:underline"
            >
              Clear Matrix Filter
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] text-slate-500 uppercase bg-slate-50 border-b border-slate-100 font-semibold">
              <tr>
                <th className="px-4 py-3">Risk ID</th>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Risk Description</th>
                <th className="px-4 py-3 text-center">P</th>
                <th className="px-4 py-3 text-center">I</th>
                <th className="px-4 py-3 text-center">Score</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action Owner</th>
                <th className="px-4 py-3">Mitigation Action Plan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRisks.map((risk) => {
                const score = risk.probability * risk.impact;
                return (
                  <tr key={risk.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-indigo-600">{risk.id}</td>
                    <td className="px-4 py-3 text-slate-600">{risk.project}</td>
                    <td className="px-4 py-3 font-medium text-slate-800 max-w-xs">{risk.title}</td>
                    <td className="px-4 py-3 text-center font-bold text-slate-700">{risk.probability}</td>
                    <td className="px-4 py-3 text-center font-bold text-slate-700">{risk.impact}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded font-bold text-xs ${
                        score >= 15 ? 'bg-rose-100 text-rose-800' :
                        score >= 10 ? 'bg-orange-100 text-orange-800' :
                        score >= 5 ? 'bg-amber-100 text-amber-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {score}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">{risk.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{risk.owner}</td>
                    <td className="px-4 py-3 text-slate-700 max-w-sm italic">
                      {risk.mitigationPlan}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
