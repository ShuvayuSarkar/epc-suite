import React, { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatsCard } from '../../components/ui/StatsCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Map, Users, TrendingUp, Target, Plus, ArrowRight, FileCheck, Layers, ClipboardList } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { usePersistentState } from '../../hooks/usePersistentState';
import { usePermission } from '../../hooks/usePermission';
import { useAuth } from '../../contexts/AuthContext';
import { ModuleId, canView, canEdit } from '../../config/rbac';

const initialDailyProgress = [
  { day: '1', Actual: 2.1, Target: 2.5 },
  { day: '5', Actual: 2.4, Target: 2.5 },
  { day: '10', Actual: 2.8, Target: 2.5 },
  { day: '15', Actual: 2.2, Target: 2.5 },
  { day: '20', Actual: 2.6, Target: 2.5 },
  { day: '25', Actual: 3.1, Target: 2.5 },
  { day: '30', Actual: 2.9, Target: 2.5 },
];

const initialGangs = [
  { id: 'G-101', name: 'Alpha Erection Gang', type: 'Erection', today: '1.2 km', efficiency: 95, terrain: 'Hilly' },
  { id: 'G-102', name: 'Bravo Stringing Gang', type: 'Stringing', today: '1.8 km', efficiency: 110, terrain: 'Plains' },
  { id: 'G-103', name: 'Charlie Foundation Gang', type: 'Foundation', today: '4 locs', efficiency: 85, terrain: 'Swampy' },
  { id: 'G-104', name: 'Delta Civil Gang', type: 'Civil Works', today: '0.8 km', efficiency: 90, terrain: 'Rocky' },
];

const initialDprs = [
  { id: 'DPR-4021', gang: 'Alpha Erection Gang', project: 'NTPC Lara', date: 'Today', submittedBy: 'Ramesh K.', status: 'Approved' },
  { id: 'DPR-4020', gang: 'Bravo Stringing Gang', project: 'NTPC Lara', date: 'Today', submittedBy: 'Suresh M.', status: 'Pending' },
  { id: 'DPR-4019', gang: 'Charlie Foundation Gang', project: 'IndiGrid Bhopal', date: 'Yesterday', submittedBy: 'Vikash S.', status: 'Approved' },
  { id: 'DPR-4018', gang: 'Delta Civil Gang', project: 'MSETCL Aurangabad', date: 'Yesterday', submittedBy: 'Arun P.', status: 'Rejected' },
];

export default function InstallationDashboard() {
  const navigate = useNavigate();
  const { getEffectivePermission } = useAuth();
  const { canCreate } = usePermission('4.1');
  const [dprs] = usePersistentState<any[]>('epc_dpr_logs', initialDprs);
  const [gangs] = usePersistentState<any[]>('epc_gangs', initialGangs);

  const [storedProjects] = usePersistentState<any[]>('epc_projects', []);

  const totalKmInstalled = useMemo(() => {
    let sum = 0;
    dprs.forEach(d => {
      const val = parseFloat(d.kmInstalled || d.today || '0');
      if (!isNaN(val)) sum += val;
    });
    return sum > 0 ? `${sum.toFixed(1)} km` : '684 km';
  }, [dprs]);

  const activeGangsCount = gangs.length > 0 ? String(gangs.length) : '42';

  const gangCards = useMemo(() => {
    return gangs.slice(0, 4).map((g, idx) => ({
      id: g.id || `G-${idx + 101}`,
      name: g.name || g.GangName || 'Execution Gang',
      type: g.type || g.GangType || 'Erection',
      today: g.today || `${g.kmInstalled || '1.2'} km`,
      efficiency: Number(g.efficiency || g.biometricPct || 95),
      terrain: g.terrain || g.TerrainType || 'Plains'
    }));
  }, [gangs]);

  const recentDprs = useMemo(() => {
    return dprs.slice(0, 6).map((d, idx) => ({
      id: d.id || d.dprNumber || `DPR-40${idx + 18}`,
      gang: d.gang || d.gangName || (gangs[idx % gangs.length]?.name || 'Alpha Gang'),
      project: d.project || d.projectName || storedProjects[idx % (storedProjects.length || 1)]?.name || 'Transmission Project',
      status: d.status || 'Approved'
    }));
  }, [dprs, gangs, storedProjects]);

  return (
    <div className="space-y-6">
      {/* Header with Title and Creation Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <PageHeader 
          title="Field Execution & Installation" 
          subtitle="Tower foundation, erection, stringing progress, DPR tracking, and gang productivity"
        />
        <div className="flex items-center gap-3">
          {canCreate && (
            <>
              <Button 
                onClick={() => navigate('/installation/dpr')} 
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Plus size={16} /> Submit Daily DPR
              </Button>
              <Button 
                onClick={() => navigate('/installation/jmc')} 
                variant="outline"
                className="flex items-center gap-2"
              >
                <FileCheck size={16} /> Record JMC
              </Button>
            </>
          )}
          {canEdit(getEffectivePermission('4.3')) && (
            <Button 
              onClick={() => navigate('/gangs')} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <Users size={16} /> Manage Gangs
            </Button>
          )}
        </div>
      </div>

      {/* Sub-Navigation Quick Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {[
          { label: 'Execution Overview', href: '/installation', icon: <Layers size={14} />, moduleId: '4.1' as ModuleId },
          { label: 'Daily Progress (DPR)', href: '/installation/dpr', icon: <ClipboardList size={14} />, moduleId: '4.1' as ModuleId },
          { label: 'Joint Measurement (JMC)', href: '/installation/jmc', icon: <FileCheck size={14} />, moduleId: '4.1' as ModuleId },
          { label: 'Execution Gangs', href: '/gangs', icon: <Users size={14} />, moduleId: '4.3' as ModuleId },
          { label: 'Site Surveys (GPS)', href: '/site-surveys', icon: <Map size={14} />, moduleId: '4.4' as ModuleId },
        ]
          .filter(item => canView(getEffectivePermission(item.moduleId)))
          .map(item => (
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

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total KM Target" value="1,245 km" icon={<Target className="text-indigo-500" />} />
        <StatsCard title="KM Installed" value={totalKmInstalled} icon={<TrendingUp className="text-emerald-500" />} trend="55% completion" trendPositive={true} />
        <StatsCard title="Active Gangs" value={activeGangsCount} icon={<Users className="text-amber-500" />} />
        <StatsCard title="Avg KM/Day" value="2.6 km" icon={<TrendingUp className="text-indigo-500" />} trend="+0.2 km from last month" trendPositive={true} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Progress Chart */}
        <Card className="p-4 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Daily Progress vs Target (Last 30 Days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={initialDailyProgress} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" fontSize={12} />
                <YAxis fontSize={12} />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="Actual" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
                <ReferenceLine y={2.5} label="Target (2.5)" stroke="#ef4444" strokeDasharray="3 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Map Placeholder */}
        <Card className="p-0 overflow-hidden flex flex-col">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold flex items-center gap-2"><Map size={18} /> GPS Tracking Map</h3>
          </div>
          <div className="flex-1 bg-slate-100 flex flex-col items-center justify-center p-6 text-center">
            <Map size={48} className="text-slate-300 mb-2" />
            <p className="text-slate-500 font-medium">GPS Geofenced DPR Tracking</p>
            <p className="text-sm text-slate-400 mt-2">Daily progress and active gangs geofenced to authorized ROW corridors.</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Gangs Status */}
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Active Performing Gangs</h3>
            <Link to="/gangs" className="text-xs font-medium text-indigo-600 hover:underline">
              {gangs.length} gangs mobilized →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {gangCards.map(gang => (
              <div key={gang.id} className="border border-slate-200 rounded-lg p-3 hover:shadow-sm transition-shadow bg-white">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-slate-800 text-sm truncate" title={gang.name}>{gang.name}</h4>
                  <Badge variant="outline" className="text-xs">{gang.type}</Badge>
                </div>
                <div className="flex justify-between items-end mt-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Progress Today</p>
                    <p className="font-bold text-indigo-600">{gang.today}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 mb-1">Efficiency</p>
                    <p className={`font-bold ${gang.efficiency >= 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {gang.efficiency}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* DPR Table */}
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center flex-wrap gap-2">
            <div>
              <h3 className="text-lg font-semibold">Recent DPR Submissions</h3>
              <span className="text-xs text-slate-500">{dprs.length} total logs</span>
            </div>
            <Button 
              size="sm" 
              onClick={() => navigate('/installation/dpr')}
              className="text-xs flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              View Full DPR Register <ArrowRight size={13} />
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                <tr>
                  <th className="px-4 py-3">DPR ID</th>
                  <th className="px-4 py-3">Gang / Team</th>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentDprs.map((dpr, i) => (
                  <tr key={i} className="border-b hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-indigo-600">{dpr.id}</td>
                    <td className="px-4 py-3">{dpr.gang}</td>
                    <td className="px-4 py-3 text-slate-600">{dpr.project}</td>
                    <td className="px-4 py-3">
                      <Badge variant={dpr.status === 'Approved' ? 'outline' : dpr.status === 'Rejected' ? 'default' : 'secondary'}
                             className={dpr.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : dpr.status === 'Rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}>
                        {dpr.status}
                      </Badge>
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
