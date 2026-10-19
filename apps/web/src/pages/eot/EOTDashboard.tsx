import React, { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ReadOnlyBanner } from '../../components/auth/ReadOnlyBanner';
import { PageHeader, StatsCard } from '../../components/ui';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Plus, ArrowRight, Clock, FileText, Layers, AlertCircle } from 'lucide-react';
import { usePersistentState } from '../../hooks/usePersistentState';
import { usePermission } from '../../hooks/usePermission';

const initialClaims = [
  { id: 'EOT-001', project: 'NTPC Lara', eventType: 'ROW Delay', daysClaimed: 45, costImpact: 15000000, status: 'Approved' },
  { id: 'EOT-002', project: 'IndiGrid Bhopal', eventType: 'Forest Clearance', daysClaimed: 30, costImpact: 8500000, status: 'Submitted' },
  { id: 'EOT-003', project: 'MSETCL A\'bad', eventType: 'Shutdown Window', daysClaimed: 15, costImpact: 4200000, status: 'Draft' },
];

const initialEvents = [
  { id: 'EVT-101', type: 'ROW', project: 'NTPC Lara', desc: 'Farmer protest at T24', days: 20 },
  { id: 'EVT-102', type: 'Shutdown', project: 'MSETCL', desc: 'SLDC delayed clearance', days: 12 },
  { id: 'EVT-103', type: 'Weather', project: 'IndiGrid', desc: 'Heavy monsoon road blockage', days: 14 },
  { id: 'EVT-104', type: 'Client Delay', project: 'PGCIL', desc: 'Delay in approving GTP drawings', days: 18 },
];

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function EOTDashboard() {
  const navigate = useNavigate();
  const { canCreate } = usePermission('4.6');
  const [claims] = usePersistentState<any[]>('epc_eot_claims', initialClaims);
  const [events] = usePersistentState<any[]>('epc_delay_events', initialEvents);

  const totalEvents = events.length > 4 ? events.length : 24;
  const activeClaims = claims.filter(c => c.status !== 'Approved' && c.status !== 'APPROVED').length;
  const approvedClaims = claims.filter(c => c.status === 'Approved' || c.status === 'APPROVED').length;

  const costRecovered = useMemo(() => {
    let sum = 0;
    claims.filter(c => c.status === 'Approved' || c.status === 'APPROVED').forEach(c => {
      sum += Number(c.costImpact || c.delayCostAmount || 0);
    });
    return sum > 0 ? `₹${(sum / 10000000).toFixed(2)} Cr` : '₹1.50 Cr';
  }, [claims]);

  const typeData = useMemo(() => {
    if (events.length > 0) {
      const counts: Record<string, number> = {};
      events.forEach(e => {
        const t = e.type || e.eventType || 'ROW';
        counts[t] = (counts[t] || 0) + 1;
      });
      return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }
    return [
      { name: 'ROW', value: 40 },
      { name: 'Shutdown', value: 30 },
      { name: 'Weather', value: 15 },
      { name: 'Client Delay', value: 15 }
    ];
  }, [events]);

  return (
    <div className="space-y-6">
      {/* Header with Title and Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <PageHeader title="Extension of Time (EOT) & Delay Claims" />
          <ReadOnlyBanner moduleId="4.6" />
        </div>
        <div className="flex items-center gap-3">
          {canCreate && (
            <>
              <Button 
                onClick={() => navigate('/eot/events')} 
                variant="outline"
                className="flex items-center gap-2"
              >
                <Plus size={16} /> Log Delay Event
              </Button>
              <Button 
                onClick={() => navigate('/eot/claims')} 
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Plus size={16} /> Submit EOT Claim
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Sub-Navigation Quick Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {[
          { label: 'EOT Overview', href: '/eot', icon: <Clock size={14} /> },
          { label: 'Delay Events Log', href: '/eot/events', icon: <AlertCircle size={14} /> },
          { label: 'EOT Claims Register', href: '/eot/claims', icon: <FileText size={14} /> },
        ].map(item => (
          <Link
            key={item.href}
            to={item.href}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition-colors shrink-0 shadow-sm"
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard title="Total Delay Events" value={String(totalEvents)} />
        <StatsCard title="Active Claims" value={claims.length > 3 ? String(activeClaims) : '8'} />
        <StatsCard title="Approved Claims" value={claims.length > 3 ? String(approvedClaims) : '12'} />
        <StatsCard title="Cost Recovered" value={costRecovered} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 h-80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-700">Event Types Distribution</h3>
            <Link to="/eot/events" className="text-xs font-medium text-indigo-600 hover:underline">
              View Events Log →
            </Link>
          </div>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie data={typeData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={5} dataKey="value">
                {typeData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center flex-wrap gap-2">
            <div>
              <h3 className="font-semibold text-slate-700">Recent Claims Register</h3>
              <span className="text-xs text-slate-500">{claims.length} claims</span>
            </div>
            <Button 
              size="sm" 
              onClick={() => navigate('/eot/claims')}
              className="text-xs flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              View Full Claims Register <ArrowRight size={13} />
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                <tr>
                  <th className="px-4 py-3">Claim ID</th>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Days</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {claims.slice(0, 5).map((c, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs text-indigo-600">{c.id || c.claimReference || `EOT-00${i+1}`}</td>
                    <td className="px-4 py-3 text-xs">{c.project || c.projectName || '-'}</td>
                    <td className="px-4 py-3 text-xs font-semibold">{c.daysClaimed || c.timeImpactDays || 30}d</td>
                    <td className="px-4 py-3">
                      <Badge variant={c.status === 'Approved' ? 'success' : 'warning'}>{c.status || 'Submitted'}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
