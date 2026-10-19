import React, { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatsCard } from '../../components/ui/StatsCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ClipboardCheck, ShieldCheck, FileWarning, Clock, Plus, ArrowRight, Layers, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { usePersistentState } from '../../hooks/usePersistentState';
import { usePermission } from '../../hooks/usePermission';

const initialInspections = [
  { id: 'IR-24-890', project: 'NTPC Lara', type: 'Site Receipt', item: 'Tower Parts', date: 'Today', status: 'Pass' },
  { id: 'IR-24-889', project: 'IndiGrid', type: 'Erection', item: 'Loc 45 Foundation', date: 'Yesterday', status: 'Conditional' },
  { id: 'IR-24-888', project: 'MSETCL', type: 'FAT', item: 'Power Transformer', date: '15 May', status: 'Fail' },
  { id: 'IR-24-887', project: 'PGCIL', type: 'TPIA', item: 'OPGW Drum', date: '14 May', status: 'Pass' },
];

const initialNcrs = [
  { id: 'NCR-105', project: "MSETCL A'bad", severity: 'Critical', desc: 'Transformer Oil Leak test failed', raised: '15 May 2024', owner: 'Quality Head', status: 'OPEN' },
  { id: 'NCR-102', project: 'NTPC Lara', severity: 'Major', desc: 'Tower member galvanizing thickness low', raised: '02 May 2024', owner: 'Site QC', status: 'OPEN' },
  { id: 'NCR-098', project: 'TSECL Agartala', severity: 'Major', desc: 'Concrete slump test failed at Loc 22', raised: '25 Apr 2024', owner: 'Site QC', status: 'OPEN' },
];

const initialInspectionChart = [
  { type: 'Factory (FAT)', Pass: 45, Conditional: 10, Fail: 2 },
  { type: 'TPIA', Pass: 30, Conditional: 5, Fail: 1 },
  { type: 'Site Receipt', Pass: 85, Conditional: 15, Fail: 5 },
  { type: 'Erection', Pass: 120, Conditional: 25, Fail: 8 },
];

const initialNcrAging = [
  { severity: 'Critical', '<15d': 2, '15-30d': 1, '>30d': 0 },
  { severity: 'Major', '<15d': 5, '15-30d': 3, '>30d': 2 },
  { severity: 'Minor', '<15d': 15, '15-30d': 8, '>30d': 5 },
];

export default function QAQCDashboard() {
  const navigate = useNavigate();
  const { canCreate } = usePermission('4.13');
  const [inspections] = usePersistentState<any[]>('epc_inspections', initialInspections);
  const [ncrs] = usePersistentState<any[]>('epc_ncrs', initialNcrs);
  const [storedProjects] = usePersistentState<any[]>('epc_projects', []);

  const totalInspections = inspections.length > 4 ? inspections.length : 352;
  const passCount = inspections.filter(i => i.status === 'Pass' || i.result === 'Pass' || i.result === 'PASS').length;
  const passRate = inspections.length > 4 ? `${Math.round((passCount / inspections.length) * 100)}%` : '88.5%';
  const openNcrsCount = ncrs.filter(n => n.status !== 'Closed' && n.status !== 'CLOSED').length;
  const openNcrsDisplay = ncrs.length > 3 ? String(openNcrsCount) : '41';

  const recentInspections = useMemo(() => {
    return inspections.slice(0, 6).map((insp, idx) => ({
      id: insp.id || insp.inspectionId || `IR-24-${890 - idx}`,
      project: insp.project || insp.projectName || storedProjects[idx % (storedProjects.length || 1)]?.name || 'Transmission Project',
      type: insp.type || insp.inspectionType || 'Site Receipt',
      item: insp.item || insp.category || 'Tower Components',
      status: insp.status || insp.result || 'Pass'
    }));
  }, [inspections, storedProjects]);

  const recentNcrs = useMemo(() => {
    return ncrs.slice(0, 6).map((ncr, idx) => ({
      id: ncr.id || ncr.ncrId || `NCR-10${5 - idx}`,
      project: ncr.project || ncr.projectName || storedProjects[idx % (storedProjects.length || 1)]?.name || 'Transmission Project',
      severity: ncr.severity || 'Major',
      desc: ncr.desc || ncr.description || 'Non-conformance observed',
      raised: ncr.raised || ncr.createdAt || 'Recent'
    }));
  }, [ncrs, storedProjects]);

  return (
    <div className="space-y-6">
      {/* Header with Title and Creation Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <PageHeader 
          title="Quality Assurance & Quality Control (QA/QC)" 
          subtitle="Inspection call letters, FAT, TPIA testing, NCR management, and CAPA resolution tracking"
        />
        <div className="flex items-center gap-3">
          {canCreate && (
            <>
              <Button 
                onClick={() => navigate('/qa-qc/inspections')} 
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Plus size={16} /> Schedule Inspection
              </Button>
              <Button 
                onClick={() => navigate('/qa-qc/ncrs')} 
                variant="outline"
                className="flex items-center gap-2 text-rose-700 border-rose-300 hover:bg-rose-50"
              >
                <Plus size={16} /> Log New NCR
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Sub-Navigation Quick Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {[
          { label: 'QA/QC Overview', href: '/qa-qc', icon: <ClipboardCheck size={14} /> },
          { label: 'Inspections Register', href: '/qa-qc/inspections', icon: <ShieldCheck size={14} /> },
          { label: 'NCR Register', href: '/qa-qc/ncrs', icon: <FileWarning size={14} /> },
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
        <StatsCard title="Total Inspections" value={String(totalInspections)} icon={<ClipboardCheck className="text-indigo-500" />} />
        <StatsCard title="Pass Rate" value={passRate} icon={<ShieldCheck className="text-emerald-500" />} trend="+2.1% this month" trendPositive={true} />
        <StatsCard title="Open NCRs" value={openNcrsDisplay} icon={<FileWarning className="text-rose-500" />} trend="-5 since last week" trendPositive={true} />
        <StatsCard title="Avg NCR Closure" value="14 Days" icon={<Clock className="text-amber-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inspection Results */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Inspection Results by Type (YTD)</h3>
            <Link to="/qa-qc/inspections" className="text-xs font-medium text-indigo-600 hover:underline">
              View Register
            </Link>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={initialInspectionChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="type" fontSize={12} />
                <YAxis fontSize={12} />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="Pass" stackId="a" fill="#10b981" />
                <Bar dataKey="Conditional" stackId="a" fill="#f59e0b" />
                <Bar dataKey="Fail" stackId="a" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* NCR Aging */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Open NCR Aging</h3>
            <Link to="/qa-qc/ncrs" className="text-xs font-medium text-rose-600 hover:underline">
              View All NCRs
            </Link>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={initialNcrAging} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="severity" fontSize={12} />
                <YAxis fontSize={12} />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="<15d" fill="#3b82f6" />
                <Bar dataKey="15-30d" fill="#f59e0b" />
                <Bar dataKey=">30d" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Inspections Table */}
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center flex-wrap gap-2">
            <div>
              <h3 className="text-lg font-semibold">Recent Inspections</h3>
              <span className="text-xs text-slate-500">{inspections.length} recorded</span>
            </div>
            <Button 
              size="sm" 
              onClick={() => navigate('/qa-qc/inspections')}
              className="text-xs flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              View Full Inspection Register <ArrowRight size={13} />
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                <tr>
                  <th className="px-4 py-3">Report ID</th>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Type / Item</th>
                  <th className="px-4 py-3">Result</th>
                </tr>
              </thead>
              <tbody>
                {recentInspections.map((insp, i) => (
                  <tr key={i} className="border-b hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-indigo-600">{insp.id}</td>
                    <td className="px-4 py-3">{insp.project}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{insp.type}</p>
                      <p className="text-xs text-slate-500">{insp.item}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={
                        insp.status === 'Pass' || insp.status === 'PASS' ? 'border-emerald-500 text-emerald-700' :
                        insp.status === 'Fail' || insp.status === 'FAIL' ? 'border-rose-500 text-rose-700' : 'border-amber-500 text-amber-700'
                      }>{insp.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Open NCRs Table */}
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center flex-wrap gap-2">
            <div>
              <h3 className="text-lg font-semibold text-rose-600">Critical & Major Open NCRs</h3>
              <span className="text-xs text-slate-500">{ncrs.length} total NCRs</span>
            </div>
            <Button 
              size="sm" 
              onClick={() => navigate('/qa-qc/ncrs')}
              variant="outline"
              className="text-xs flex items-center gap-1.5 text-rose-700 border-rose-300 hover:bg-rose-50"
            >
              View Full NCR Register <ArrowRight size={13} />
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                <tr>
                  <th className="px-4 py-3">NCR ID</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3">Raised On</th>
                </tr>
              </thead>
              <tbody>
                {recentNcrs.map((ncr, i) => (
                  <tr key={i} className="border-b hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-indigo-600">{ncr.id}</td>
                    <td className="px-4 py-3">
                      <p className="text-slate-800 text-xs font-medium">{ncr.project}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{ncr.desc}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={ncr.severity === 'Critical' ? 'default' : 'secondary'} className={ncr.severity === 'Critical' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}>
                        {ncr.severity}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{ncr.raised}</td>
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
