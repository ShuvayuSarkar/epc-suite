import React, { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ReadOnlyBanner } from '../../components/auth/ReadOnlyBanner';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatsCard } from '../../components/ui/StatsCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ShieldAlert, ShieldCheck, FileWarning, BookOpen, Plus, ArrowRight, ClipboardCheck } from 'lucide-react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { usePersistentState } from '../../hooks/usePersistentState';
import { usePermission } from '../../hooks/usePermission';

const initialIncidents = [
  { id: 'INC-24-042', project: 'NTPC Lara', date: '15 May 2024', type: 'Slip & Fall', severity: 'Minor', status: 'Closed' },
  { id: 'INC-24-043', project: 'IndiGrid Bhopal', date: '10 May 2024', type: 'Machinery Failure', severity: 'Major', status: 'Investigating' },
  { id: 'INC-24-044', project: 'MSETCL Aurangabad', date: '02 May 2024', type: 'Electrical Arc', severity: 'Critical', status: 'CAPA Pending' },
  { id: 'INC-24-045', project: 'TSECL Agartala', date: '28 Apr 2024', type: 'Vehicle Collision', severity: 'Minor', status: 'Closed' },
];

const initialAudits = [
  { site: 'NTPC Lara Site A', auditor: 'External (BSI)', date: '22 May 2024', focus: 'Lifting Operations' },
  { site: 'MPPTCL Jabalpur', auditor: 'Internal HSE Head', date: '25 May 2024', focus: 'General Safety Compliance' },
  { site: 'PowerGrid NER-II', auditor: 'Client HSE Team', date: '01 Jun 2024', focus: 'Electrical Safety' },
];

const COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#000000'];

const incidentTrendData = [
  { month: 'Jan', Incidents: 8, NearMisses: 15 },
  { month: 'Feb', Incidents: 6, NearMisses: 12 },
  { month: 'Mar', Incidents: 10, NearMisses: 18 },
  { month: 'Apr', Incidents: 5, NearMisses: 9 },
  { month: 'May', Incidents: 4, NearMisses: 7 },
  { month: 'Jun', Incidents: 2, NearMisses: 5 },
];

export default function SafetyDashboard() {
  const navigate = useNavigate();
  const { canCreate } = usePermission('4.12');
  const [incidents] = usePersistentState<any[]>('epc_safety_incidents', initialIncidents);
  const [audits] = usePersistentState<any[]>('epc_safety_audits', initialAudits);
  const [storedProjects] = usePersistentState<any[]>('epc_projects', []);

  const totalIncidents = incidents.length > 4 ? incidents.length : 55;
  const openIncidents = incidents.filter(i => i.status !== 'Closed' && i.status !== 'CLOSED').length;
  const openHseNcrs = incidents.length > 4 ? String(openIncidents) : '14';

  const severityData = useMemo(() => {
    return [
      { name: 'Minor (First Aid)', value: Math.max(incidents.filter(i => i.severity === 'Minor').length, 45) },
      { name: 'Major (Lost Time)', value: Math.max(incidents.filter(i => i.severity === 'Major').length, 8) },
      { name: 'Critical', value: Math.max(incidents.filter(i => i.severity === 'Critical').length, 2) },
      { name: 'Fatal', value: 0 },
    ];
  }, [incidents]);

  const recentIncidents = useMemo(() => {
    return incidents.slice(0, 6).map((inc, idx) => ({
      id: inc.id || inc.incidentId || `INC-24-${42 + idx}`,
      project: inc.project || inc.location || storedProjects[idx % (storedProjects.length || 1)]?.name || 'Transmission Project',
      date: inc.date || inc.reportedDate || 'Recent',
      type: inc.type || inc.incidentType || 'General Hazard',
      severity: inc.severity || 'Minor',
      status: inc.status || inc.investigationStatus || 'Closed'
    }));
  }, [incidents, storedProjects]);

  return (
    <div className="space-y-6">
      {/* Header with Title and Creation Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <PageHeader 
            title="Safety & HSE Dashboard" 
            subtitle="Health, Safety, and Environment monitoring, incident tracking, LTI metrics, and safety audits"
          />
          <ReadOnlyBanner moduleId="4.12" />
        </div>
        <div className="flex items-center gap-3">
          {canCreate && (
            <>
              <Button 
                onClick={() => navigate('/safety/incidents')} 
                className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white"
              >
                <Plus size={16} /> Report Incident
              </Button>
              <Button 
                onClick={() => navigate('/safety/audits')} 
                variant="outline"
                className="flex items-center gap-2"
              >
                <Plus size={16} /> Schedule Safety Audit
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Sub-Navigation Quick Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {[
          { label: 'Safety Overview', href: '/safety', icon: <ShieldCheck size={14} /> },
          { label: 'Incidents & Near Misses', href: '/safety/incidents', icon: <ShieldAlert size={14} /> },
          { label: 'Safety Audits & Compliance', href: '/safety/audits', icon: <ClipboardCheck size={14} /> },
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

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Incidents (YTD)" value={String(totalIncidents)} icon={<ShieldAlert className="text-amber-500" />} />
        <StatsCard title="Days Without LTI" value="42" icon={<ShieldCheck className="text-emerald-500" />} trend="Target: 100 days" trendPositive={false} />
        <StatsCard title="Open HSE NCRs" value={openHseNcrs} icon={<FileWarning className="text-rose-500" />} />
        <StatsCard title="Toolbox Compliance" value="98%" icon={<BookOpen className="text-indigo-500" />} trend="Above target (95%)" trendPositive={true} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Distribution */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Incidents by Severity (YTD)</h3>
            <Link to="/safety/incidents" className="text-xs font-medium text-indigo-600 hover:underline">
              View Register
            </Link>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {severityData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '12px' }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Monthly Trend */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Monthly Safety Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={incidentTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="Incidents" stroke="#ef4444" strokeWidth={2} />
                <Line type="monotone" dataKey="NearMisses" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Incidents Table */}
        <Card className="p-0 overflow-hidden lg:col-span-2">
          <div className="p-4 border-b flex justify-between items-center flex-wrap gap-2">
            <div>
              <h3 className="text-lg font-semibold">Recent Incidents & Near Misses</h3>
              <span className="text-xs text-slate-500">{incidents.length} logs</span>
            </div>
            <Button 
              size="sm" 
              onClick={() => navigate('/safety/incidents')}
              className="text-xs flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white"
            >
              View Full Incident Register <ArrowRight size={13} />
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                <tr>
                  <th className="px-4 py-3">Incident ID</th>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Type & Severity</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentIncidents.map((inc, i) => (
                  <tr key={i} className="border-b hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-indigo-600">{inc.id}</td>
                    <td className="px-4 py-3 text-slate-700">{inc.project}</td>
                    <td className="px-4 py-3 text-slate-500">{inc.date}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span>{inc.type}</span>
                        <Badge variant="outline" className={inc.severity === 'Critical' ? 'border-rose-500 text-rose-700' : inc.severity === 'Major' ? 'border-amber-500 text-amber-700' : ''}>
                          {inc.severity}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className={inc.status === 'Closed' ? 'bg-slate-100 text-slate-600' : 'bg-rose-100 text-rose-800'}>
                        {inc.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Upcoming Audits */}
        <Card className="p-0 overflow-hidden lg:col-span-1">
          <div className="p-4 border-b flex justify-between items-center flex-wrap gap-2">
            <div>
              <h3 className="text-lg font-semibold">Upcoming Audits</h3>
              <span className="text-xs text-slate-500">{audits.length} planned</span>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => navigate('/safety/audits')}
              className="text-xs flex items-center gap-1.5"
            >
              Audits List <ArrowRight size={13} />
            </Button>
          </div>
          <div className="p-4 space-y-4">
            {audits.map((audit: any, i: number) => (
              <div key={i} className="border-l-4 border-l-indigo-500 pl-4 py-1">
                <p className="font-semibold text-slate-800 text-sm">{audit.site || audit.auditorName}</p>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-slate-500">{audit.auditor || audit.auditType}</p>
                  <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{audit.date || audit.auditDate}</span>
                </div>
                <p className="text-xs text-slate-600 mt-2"><span className="font-medium text-slate-700">Focus:</span> {audit.focus || audit.findings || 'General Compliance'}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
