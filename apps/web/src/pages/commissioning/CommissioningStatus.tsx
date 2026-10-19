import React from 'react';
import { PageHeader, StatsCard, DataTable, Badge } from '../../components/ui';
import { usePersistentState } from '../../hooks/usePersistentState';

const initialPunchList = [
  { id: 'PL-01', item: 'Tighten bolts on Tower 45', severity: 'A', status: 'OPEN' },
  { id: 'PL-02', item: 'Paint touch-up at base', severity: 'C', status: 'CLOSED' },
  { id: 'PL-03', item: 'Grounding lead torque check', severity: 'B', status: 'OPEN' },
];

const columns = [
  { header: 'ID', accessor: 'id' },
  { header: 'Item / Defect', accessor: 'item', cell: (v: string, row: any) => v || row?.description || 'Defect item' },
  { header: 'Severity', accessor: 'severity', cell: (v: string) => <Badge variant={v === 'A' ? 'danger' : v === 'B' ? 'warning' : 'primary'}>Cat {v}</Badge> },
  { header: 'Status', accessor: 'status', cell: (v: string) => <Badge variant={v === 'CLOSED' || v === 'Closed' ? 'success' : 'danger'}>{v || 'OPEN'}</Badge> }
];

export default function CommissioningStatus() {
  const [punchList] = usePersistentState<any[]>('epc_commissioning_punch', initialPunchList);
  const [tncRecords] = usePersistentState<any[]>('epc_commissioning_tnc', []);

  const totalPunch = punchList.length;
  const openCatA = punchList.filter(p => (p.severity === 'A' || p.Severity === 'A') && (p.status !== 'Closed' && p.status !== 'CLOSED')).length;
  const completedTnc = tncRecords.filter(t => ['Completed', 'Client Approved'].includes(t.status)).length;
  const tncProgress = tncRecords.length > 0 ? Math.round((completedTnc / tncRecords.length) * 100) : 85;

  return (
    <div className="space-y-6">
      <PageHeader title="Commissioning & Handover Status" />
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard title="T&C Progress" value={`${tncProgress}%`} />
        <StatsCard title="Open Punch Items (Cat A)" value={String(openCatA)} />
        <StatsCard title="Total Punch Items" value={String(totalPunch)} />
        <StatsCard title="Handover Docs" value="12/15" />
      </div>

      <div className="bg-white rounded-lg shadow-sm mt-6">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-medium text-slate-700">Punch List Register</h3>
          <span className="text-xs text-slate-500">{punchList.length} items registered</span>
        </div>
        <DataTable columns={columns} data={punchList} />
      </div>
    </div>
  );
}
