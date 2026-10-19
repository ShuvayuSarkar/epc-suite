import os

content = """\
// StatutoryVerification.tsx
// BRD Gap 2.8 - Statutory verification (factory/PCB/labor/vehicle licenses)

import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Tabs from '../../components/ui/Tabs';
import { FileCheck, AlertOctagon, Clock, XCircle, CalendarDays } from 'lucide-react';

// BRD 2.8: License types as defined in statutory compliance requirements
type LicenseType =
  | 'Factory License'
  | 'PCB Consent to Operate'
  | 'PCB Consent to Establish'
  | 'Labor License (Contractor)'
  | 'Vehicle Fitness Certificate'
  | 'Pollution Certificate'
  | 'Fire NOC'
  | 'Electrical Inspector Certificate'
  | 'PTCC (Power Transmission)'
  | 'State Electricity Board NOC';

type EntityType = 'Company' | 'Vendor';
type LicenseStatus = 'Valid' | 'Expiring' | 'Expired' | 'Missing';

interface License {
  id: string;
  type: LicenseType;
  licenseNumber: string;
  issuingAuthority: string;
  issuedDate: string;
  validTill: string;
  entity: EntityType;
  entityName: string;
  status: LicenseStatus;
  daysToExpiry: number;
}

interface VendorCompliance {
  vendorName: string;
  vendorId: string;
  required: LicenseType[];
  statuses: Partial<Record<LicenseType, LicenseStatus>>;
}

interface RenewalItem {
  month: string;
  licenses: License[];
}

// --- Mock Data (12 licenses: APAR company + 3 vendors) ---
const LICENSES: License[] = [
  { id: 'LIC-001', type: 'Factory License', licenseNumber: 'FL/CG/2022/00345', issuingAuthority: 'Dept. of Factories, Chhattisgarh', issuedDate: '2022-04-01', validTill: '2027-03-31', entity: 'Company', entityName: 'APAR Industries', status: 'Valid', daysToExpiry: 555 },
  { id: 'LIC-002', type: 'PCB Consent to Operate', licenseNumber: 'PCB/CG/CTO/2024/1122', issuingAuthority: 'CGPB - Raipur', issuedDate: '2024-01-15', validTill: '2025-10-20', entity: 'Company', entityName: 'APAR Industries', status: 'Expiring', daysToExpiry: 28 },
  { id: 'LIC-003', type: 'Fire NOC', licenseNumber: 'FIRE/NTPC/2023/056', issuingAuthority: 'Fire and Emergency Services, Raigarh', issuedDate: '2023-06-01', validTill: '2025-05-31', entity: 'Company', entityName: 'APAR Industries', status: 'Expired', daysToExpiry: -114 },
  { id: 'LIC-004', type: 'Labor License (Contractor)', licenseNumber: 'LL/CLC/2024/8890', issuingAuthority: 'Central Labour Commissioner', issuedDate: '2024-03-01', validTill: '2026-02-28', entity: 'Vendor', entityName: 'Kalyan Electricals', status: 'Valid', daysToExpiry: 160 },
  { id: 'LIC-005', type: 'Vehicle Fitness Certificate', licenseNumber: 'VFC/RTO-RGH/2025/0012', issuingAuthority: 'RTO Raigarh', issuedDate: '2025-01-10', validTill: '2025-10-10', entity: 'Vendor', entityName: 'Kalyan Electricals', status: 'Expiring', daysToExpiry: 18 },
  { id: 'LIC-006', type: 'Pollution Certificate', licenseNumber: 'PUC/2025/MH-12-AB-4567', issuingAuthority: 'MoRTH Authorized Center', issuedDate: '2025-02-01', validTill: '2026-01-31', entity: 'Vendor', entityName: 'Kalyan Electricals', status: 'Valid', daysToExpiry: 131 },
  { id: 'LIC-007', type: 'PCB Consent to Establish', licenseNumber: 'PCB/JH/CTE/2023/0089', issuingAuthority: 'JSPCB - Ranchi', issuedDate: '2023-11-01', validTill: '2025-10-31', entity: 'Company', entityName: 'APAR Industries', status: 'Expiring', daysToExpiry: 39 },
  { id: 'LIC-008', type: 'Electrical Inspector Certificate', licenseNumber: 'EI/CG/2024/3344', issuingAuthority: 'Electrical Inspector, Chhattisgarh', issuedDate: '2024-07-01', validTill: '2026-06-30', entity: 'Vendor', entityName: 'Suraksha Civil Works', status: 'Valid', daysToExpiry: 282 },
  { id: 'LIC-009', type: 'PTCC (Power Transmission)', licenseNumber: 'PTCC/PGCIL/2024/0077', issuingAuthority: 'PGCIL HQ New Delhi', issuedDate: '2024-04-01', validTill: '2029-03-31', entity: 'Company', entityName: 'APAR Industries', status: 'Valid', daysToExpiry: 2382 },
  { id: 'LIC-010', type: 'State Electricity Board NOC', licenseNumber: 'SEB/CSPDCL/2024/1190', issuingAuthority: 'CSPDCL', issuedDate: '2024-02-01', validTill: '2025-08-31', entity: 'Vendor', entityName: 'Suraksha Civil Works', status: 'Expired', daysToExpiry: -22 },
  { id: 'LIC-011', type: 'Labor License (Contractor)', licenseNumber: 'LL/CLC/2025/0045', issuingAuthority: 'Central Labour Commissioner', issuedDate: '2025-01-01', validTill: '2026-12-31', entity: 'Vendor', entityName: 'Suraksha Civil Works', status: 'Valid', daysToExpiry: 466 },
  { id: 'LIC-012', type: 'Fire NOC', licenseNumber: 'FIRE/JH/2024/199', issuingAuthority: 'Fire and Emergency Services, Jharkhand', issuedDate: '2024-05-01', validTill: '2026-04-30', entity: 'Vendor', entityName: 'Suraksha Civil Works', status: 'Valid', daysToExpiry: 220 },
];

const VENDOR_COMPLIANCE: VendorCompliance[] = [
  {
    vendorName: 'Kalyan Electricals',
    vendorId: 'VND-001',
    required: ['Labor License (Contractor)', 'Vehicle Fitness Certificate', 'Pollution Certificate', 'Electrical Inspector Certificate'],
    statuses: {
      'Labor License (Contractor)': 'Valid',
      'Vehicle Fitness Certificate': 'Expiring',
      'Pollution Certificate': 'Valid',
      'Electrical Inspector Certificate': 'Missing',
    },
  },
  {
    vendorName: 'Suraksha Civil Works',
    vendorId: 'VND-002',
    required: ['Labor License (Contractor)', 'State Electricity Board NOC', 'Electrical Inspector Certificate', 'Fire NOC'],
    statuses: {
      'Labor License (Contractor)': 'Valid',
      'State Electricity Board NOC': 'Expired',
      'Electrical Inspector Certificate': 'Valid',
      'Fire NOC': 'Valid',
    },
  },
  {
    vendorName: 'Raigarh Transport Co.',
    vendorId: 'VND-003',
    required: ['Vehicle Fitness Certificate', 'Pollution Certificate', 'Labor License (Contractor)'],
    statuses: {
      'Vehicle Fitness Certificate': 'Valid',
      'Pollution Certificate': 'Valid',
      'Labor License (Contractor)': 'Missing',
    },
  },
];

// --- Helpers ---
const statusVariant = (s: LicenseStatus): 'success' | 'warning' | 'danger' | 'secondary' => {
  switch (s) {
    case 'Valid': return 'success';
    case 'Expiring': return 'warning';
    case 'Expired': return 'danger';
    case 'Missing': return 'secondary';
  }
};

const ragDot = (s: LicenseStatus) => {
  const cls = 'inline-block w-3 h-3 rounded-full ';
  switch (s) {
    case 'Valid': return <span className={cls + 'bg-green-500'} title="Valid" />;
    case 'Expiring': return <span className={cls + 'bg-amber-400'} title="Expiring Soon" />;
    case 'Expired': return <span className={cls + 'bg-red-500 animate-pulse'} title="Expired" />;
    case 'Missing': return <span className={cls + 'bg-gray-400'} title="Missing" />;
  }
};

const vendorRAG = (v: VendorCompliance): 'success' | 'warning' | 'danger' => {
  const vals = Object.values(v.statuses);
  if (vals.some(s => s === 'Expired' || s === 'Missing')) return 'danger';
  if (vals.some(s => s === 'Expiring')) return 'warning';
  return 'success';
};

const RAG_LABEL: Record<'success' | 'warning' | 'danger', string> = {
  success: 'Fully Compliant',
  warning: 'Attention Required',
  danger: 'Non-Compliant - PO Blocked',
};

// --- KPI Card ---
interface KPIProps { label: string; value: string | number; icon: React.ReactNode; color: string; }
const KPICard: React.FC<KPIProps> = ({ label, value, icon, color }) => (
  <Card className="flex items-center gap-4 p-5">
    <div className={'p-3 rounded-xl ' + color}>{icon}</div>
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </Card>
);

// --- Build renewal calendar from licenses expiring within 180 days ---
const buildRenewalCalendar = (): RenewalItem[] => {
  const groups: Record<string, License[]> = {};
  LICENSES.filter(l => l.daysToExpiry >= 0 && l.daysToExpiry <= 180).forEach(l => {
    const d = new Date(l.validTill);
    const key = d.toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!groups[key]) groups[key] = [];
    groups[key].push(l);
  });
  return Object.entries(groups).map(([month, licenses]) => ({ month, licenses }));
};

const StatutoryVerification: React.FC = () => {
  const [activeTab, setActiveTab] = useState('licenses');
  const [entityFilter, setEntityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const filtered = useMemo(() => {
    return LICENSES.filter(l => {
      const ef = entityFilter === 'All' || l.entity === entityFilter || l.entityName === entityFilter;
      const sf = statusFilter === 'All' || l.status === statusFilter;
      return ef && sf;
    });
  }, [entityFilter, statusFilter]);

  const total = LICENSES.length;
  const valid = LICENSES.filter(l => l.status === 'Valid').length;
  const expiring = LICENSES.filter(l => l.status === 'Expiring').length;
  const expired = LICENSES.filter(l => l.status === 'Expired' || l.status === 'Missing').length;

  const complianceByType = useMemo(() => {
    const types = [...new Set(LICENSES.map(l => l.type))];
    return types.map(t => {
      const group = LICENSES.filter(l => l.type === t);
      return {
        type: t.length > 20 ? t.slice(0, 20) + '...' : t,
        Valid: group.filter(l => l.status === 'Valid').length,
        Expiring: group.filter(l => l.status === 'Expiring').length,
        Expired: group.filter(l => l.status === 'Expired').length,
      };
    });
  }, []);

  const renewalCalendar = useMemo(() => buildRenewalCalendar(), []);

  const tabs = [
    { id: 'licenses', label: 'License Register' },
    { id: 'vendor', label: 'Vendor Compliance' },
    { id: 'calendar', label: 'Renewal Calendar' },
  ];

  const expiryColor = (days: number) =>
    days < 30 ? 'danger' : days < 90 ? 'warning' : 'success';

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Statutory Verification"
        subtitle="BRD 2.8 - Factory, PCB, Labor and Vehicle license compliance tracking"
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Licenses" value={total} icon={<FileCheck size={22} className="text-indigo-600" />} color="bg-indigo-50" />
        <KPICard label="Valid" value={valid} icon={<FileCheck size={22} className="text-green-600" />} color="bg-green-50" />
        <KPICard label="Expiring Soon" value={expiring} icon={<Clock size={22} className="text-amber-600" />} color="bg-amber-50" />
        <KPICard label="Expired / Missing" value={expired} icon={<XCircle size={22} className="text-red-500" />} color="bg-red-50" />
      </div>

      {/* BRD 2.8: vendor with expired statutory license must be flagged - cannot issue PO */}
      {VENDOR_COMPLIANCE.some(v => vendorRAG(v) === 'danger') && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-4">
          <p className="font-bold text-red-700 flex items-center gap-2">
            <AlertOctagon size={18} />
            PO ISSUANCE BLOCKED - Non-Compliant Vendors
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {VENDOR_COMPLIANCE.filter(v => vendorRAG(v) === 'danger').map(v => (
              <span key={v.vendorId} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                {v.vendorName}
              </span>
            ))}
          </div>
          <p className="text-xs text-red-600 mt-2">
            These vendors have expired or missing statutory licenses. No new POs may be issued until compliance is restored.
          </p>
        </div>
      )}

      {/* Chart: compliance by type */}
      <Card className="p-4">
        <h3 className="font-semibold text-gray-700 mb-3">Compliance Status by License Type</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={complianceByType} margin={{ left: -10, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="type" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend verticalAlign="top" />
            <Bar dataKey="Valid" fill="#22c55e" stackId="a" />
            <Bar dataKey="Expiring" fill="#f59e0b" stackId="a" />
            <Bar dataKey="Expired" fill="#ef4444" stackId="a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Tabbed content */}
      <Card className="p-0 overflow-hidden">
        <div className="px-4 pt-4">
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        <div className="p-4">
          {/* Tab 1: License Register */}
          {activeTab === 'licenses' && (
            <>
              <div className="flex flex-wrap gap-3 mb-4">
                <div className="flex gap-1">
                  {['All', 'Company', 'Vendor'].map(o => (
                    <button
                      key={o}
                      onClick={() => setEntityFilter(o)}
                      className={'px-3 py-1 rounded-full text-xs font-medium border transition ' +
                        (entityFilter === o ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400')}
                    >
                      {o}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1 flex-wrap">
                  {['All', 'Valid', 'Expiring', 'Expired', 'Missing'].map(o => (
                    <button
                      key={o}
                      onClick={() => setStatusFilter(o)}
                      className={'px-3 py-1 rounded-full text-xs font-medium border transition ' +
                        (statusFilter === o ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-600')}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 uppercase text-xs">
                      {['ID', 'Type', 'License No.', 'Issuing Authority', 'Entity', 'Issued', 'Valid Till', 'Status', 'Days Left'].map(h => (
                        <th key={h} className="px-3 py-2 text-left font-medium whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map(l => (
                      <tr key={l.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-mono text-xs text-indigo-700">{l.id}</td>
                        <td className="px-3 py-2 text-xs max-w-[180px]">{l.type}</td>
                        <td className="px-3 py-2 font-mono text-xs">{l.licenseNumber}</td>
                        <td className="px-3 py-2 text-xs text-gray-600">{l.issuingAuthority}</td>
                        <td className="px-3 py-2">
                          <div className="text-xs font-semibold">{l.entityName}</div>
                          <div className="text-xs text-gray-400">{l.entity}</div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs">{l.issuedDate}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs">{l.validTill}</td>
                        <td className="px-3 py-2"><Badge variant={statusVariant(l.status)}>{l.status}</Badge></td>
                        <td className="px-3 py-2 text-center">
                          {l.daysToExpiry < 0
                            ? <Badge variant="danger">{l.daysToExpiry}d</Badge>
                            : <Badge variant={expiryColor(l.daysToExpiry) as 'danger' | 'warning' | 'success'}>{l.daysToExpiry}d</Badge>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Tab 2: Vendor Compliance - RAG traffic light */}
          {activeTab === 'vendor' && (
            <div className="space-y-4">
              {VENDOR_COMPLIANCE.map(v => {
                const rag = vendorRAG(v);
                const borderCls = rag === 'danger'
                  ? 'border-red-300 bg-red-50'
                  : rag === 'warning'
                    ? 'border-amber-300 bg-amber-50'
                    : 'border-green-200 bg-green-50';
                return (
                  <div key={v.vendorId} className={'border rounded-xl p-4 ' + borderCls}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-bold text-gray-800">{v.vendorName}</p>
                        <p className="text-xs text-gray-500">{v.vendorId}</p>
                      </div>
                      <Badge variant={rag}>{RAG_LABEL[rag]}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {v.required.map(lt => {
                        const s: LicenseStatus = v.statuses[lt] ?? 'Missing';
                        return (
                          <div key={lt} className="bg-white rounded-lg px-3 py-2 border border-gray-100 flex items-center gap-2">
                            {ragDot(s)}
                            <span className="text-xs text-gray-700 leading-tight">{lt}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab 3: Renewal Calendar */}
          {activeTab === 'calendar' && (
            <div className="space-y-6">
              {renewalCalendar.length === 0 && (
                <p className="text-gray-500 text-sm">No renewals due in the next 6 months.</p>
              )}
              {renewalCalendar.map(({ month, licenses: ls }) => (
                <div key={month}>
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarDays size={16} className="text-indigo-500" />
                    <h3 className="font-semibold text-gray-700">{month}</h3>
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                      {ls.length} renewal{ls.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {ls.map(l => (
                      <div key={l.id} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-2">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{l.type}</p>
                          <p className="text-xs text-gray-500">{l.entityName} - {l.licenseNumber}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={statusVariant(l.status)}>{l.daysToExpiry}d remaining</Badge>
                          <Button variant="outline" className="text-xs py-1 px-2">Assign Owner</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default StatutoryVerification;
"""

out_path = os.path.join(os.path.dirname(__file__), 'StatutoryVerification.tsx')
with open(out_path, 'w', encoding='utf-8') as f:
    f.write(content)
print(f'Written: {out_path}')
