import React, { useState } from 'react';
import { PageHeader, Tabs, DataTable } from '../../components/ui';
import { usePersistentState } from '../../hooks/usePersistentState';

const tabs = [
  { id: 'matrix', label: 'Approval Matrix' },
  { id: 'projects', label: 'Project Types' },
  { id: 'general', label: 'General' },
  { id: 'templates', label: 'Templates' }
];

const mockMatrix = [
  { step: 'Stage 3 Delay', approver: 'PM', trigger: 'Event Logged', sla: 2, esc: 'PD', configurable: true },
  { step: 'Stage 5 Delay', approver: 'PD', trigger: 'Event Logged', sla: 3, esc: 'VP', configurable: false },
  { step: 'Bill > 20L', approver: 'PD + CFO', trigger: 'Bill Submit', sla: 5, esc: 'MD', configurable: true }
];

const columns = [
  { header: 'Step', accessor: 'step' },
  { header: 'Approver', accessor: 'approver' },
  { header: 'Trigger', accessor: 'trigger' },
  { header: 'SLA (days)', accessor: 'sla' },
  { header: 'Escalation', accessor: 'esc' },
  { header: 'Client Configurable', accessor: 'configurable', cell: (v: boolean) => v ? '✅' : '❌' }
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('matrix');
  const [matrixData] = usePersistentState<any[]>('epc_approval_matrix', mockMatrix);

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" />
      
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'matrix' && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-medium text-slate-700">Configured Approval Matrix</h3>
            <span className="text-xs text-slate-500">{matrixData.length} active SLA rules</span>
          </div>
          <DataTable columns={columns} data={matrixData} />
        </div>
      )}
      
      {activeTab === 'general' && <div className="p-4 bg-white rounded shadow-sm text-sm text-slate-600">Enterprise Tenant & System Preferences configured via Super Admin Panel.</div>}
      {activeTab === 'projects' && <div className="p-4 bg-white rounded shadow-sm text-sm text-slate-600">Multi-project types: Type A (Turnkey EPC), Type B (Bay Ext.), Type C (Substation), Type D (Package Supply), Type E (Reconductoring).</div>}
      {activeTab === 'templates' && <div className="p-4 bg-white rounded shadow-sm text-sm text-slate-600">Default WBS templates and GTP/MQP deliverables mapped to project stages.</div>}
    </div>
  );
}
