import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, PageHeader, Tabs, DataTable, Badge, Button } from '../../components/ui';
import { ArrowLeft, Building2, Briefcase, FileText, CheckCircle2, DollarSign, Calendar } from 'lucide-react';
import { usePersistentState } from '../../hooks/usePersistentState';
import { Project } from '../projects/ProjectList';

type Client = {
  id: string;
  code: string;
  legalName: string;
  shortName: string;
  awardDocType: string;
  portalIntegration: string;
  retentionPct: number;
  paymentTerms: string;
  status: string;
};

const ClientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('projects');

  const [clients] = usePersistentState<Client[]>('epc_clients', []);
  const [projects] = usePersistentState<Project[]>('epc_projects', []);

  const matchedClient = clients.find(c => c.id === id || c.code === id || c.shortName === id);
  const client: Client = matchedClient || {
    id: id || 'CL',
    code: id || 'CL',
    legalName: `Client ${id || ''}`,
    shortName: id || 'Client',
    awardDocType: 'LOA',
    portalIntegration: 'API',
    retentionPct: 10,
    paymentTerms: '30 Days Net',
    status: 'Active',
  };

  const clientProjects = projects.filter(p => {
    if (!client) return false;
    const cShort = (client.shortName || '').toLowerCase();
    const cLegal = (client.legalName || '').toLowerCase();
    const pClient = (p.client || '').toLowerCase();
    return (
      (cShort && pClient.includes(cShort)) ||
      (cLegal && pClient.includes(cLegal)) ||
      (cShort && cShort.includes(pClient))
    );
  });

  const projectColumns = [
    { key: 'id', header: 'Project Code', render: (val: string) => <span className="font-mono font-medium text-indigo-600">{val}</span> },
    { key: 'name', header: 'Project Name', render: (val: string) => <span className="font-medium text-slate-900">{val}</span> },
    { key: 'stage', header: 'Stage', render: (val: string) => <Badge variant="secondary">{val}</Badge> },
    { key: 'value', header: 'Contract Value', render: (val: string) => <span className="font-medium">{val}</span> },
    { 
      key: 'completion', 
      header: 'Progress', 
      render: (val: number) => (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-slate-200 rounded-full h-1.5">
            <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${val}%` }}></div>
          </div>
          <span className="text-xs text-slate-500">{val}%</span>
        </div>
      ) 
    },
    {
      key: 'id',
      header: 'Actions',
      render: (val: string) => (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={(e) => { e.stopPropagation(); navigate(`/projects/${val}`); }}
          className="text-xs h-7 px-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
        >
          View Project
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/clients')}
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 border-slate-300"
          >
            <ArrowLeft size={15}/> Back
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{client.legalName}</h1>
              <Badge variant="outline" className="border-indigo-300 text-indigo-700 bg-indigo-50 font-medium">
                {client.shortName}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Client Code: <span className="font-mono font-medium text-indigo-600">{client.code}</span> &bull; Status: <span className="font-medium text-emerald-600">{client.status}</span>
            </p>
          </div>
        </div>
      </div>
      
      {/* Client Overview Card */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Client Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          <div><p className="text-slate-500 text-xs mb-1">Legal Entity Name</p><p className="font-medium text-slate-800">{client.legalName}</p></div>
          <div><p className="text-slate-500 text-xs mb-1">Client Code</p><p className="font-mono font-medium text-indigo-600">{client.code}</p></div>
          <div><p className="text-slate-500 text-xs mb-1">Award Doc Type</p><p className="font-medium text-slate-800"><Badge variant="outline">{client.awardDocType}</Badge></p></div>
          <div><p className="text-slate-500 text-xs mb-1">Reference Format</p><p className="font-mono text-xs text-slate-700">{client.code}/YYYY/MM/XXXX</p></div>
          <div><p className="text-slate-500 text-xs mb-1">Retention Percentage</p><p className="font-medium text-slate-800">{client.retentionPct}%</p></div>
          <div><p className="text-slate-500 text-xs mb-1">Portal Integration</p><p className="font-medium text-slate-800"><Badge variant="secondary">{client.portalIntegration}</Badge></p></div>
          <div><p className="text-slate-500 text-xs mb-1">Payment Terms</p><p className="font-medium text-slate-800">{client.paymentTerms}</p></div>
          <div><p className="text-slate-500 text-xs mb-1">Account Status</p><p className="font-medium text-emerald-600">{client.status}</p></div>
        </div>
      </Card>

      {/* Tabs Section */}
      <Card>
        <Tabs 
          tabs={[
            { id: 'projects', label: `Projects (${clientProjects.length})` },
            { id: 'sla', label: 'SLA Configuration' },
            { id: 'vendor', label: 'Vendor Panel' },
            { id: 'templates', label: 'Document Templates' },
          ]} 
          activeTab={activeTab} 
          onChange={setActiveTab} 
        />
        <div className="p-4">
          {activeTab === 'projects' && (
            clientProjects.length > 0 ? (
              <DataTable 
                data={clientProjects} 
                columns={projectColumns as any} 
                onRowClick={(row: any) => navigate(`/projects/${row.id}`)}
              />
            ) : (
              <div className="text-center py-12 text-slate-500">
                <Briefcase size={36} className="mx-auto text-slate-300 mb-2" />
                <p className="font-medium">No projects found for {client.shortName}</p>
                <p className="text-xs text-slate-400 mt-1">Projects matching this client will appear here automatically.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/projects')}
                  className="mt-4"
                >
                  Go to Project Master
                </Button>
              </div>
            )
          )}
          {activeTab === 'sla' && (
            <div className="p-4 text-sm text-slate-600 space-y-2">
              <p className="font-medium text-slate-800">SLA & Penalty Framework for {client.shortName}:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>Material inspection clearance turnaround: <strong>7 Working Days</strong></li>
                <li>Invoice submission to payment realization cycle: <strong>{client.paymentTerms}</strong></li>
                <li>Liquidated Damages (LD) clause cap: <strong>10% of Contract Value</strong></li>
                <li>RFI resolution timeline: <strong>48 Hours</strong></li>
              </ul>
            </div>
          )}
          {activeTab === 'vendor' && (
            <div className="p-4 text-sm text-slate-600">
              <p className="font-medium text-slate-800 mb-2">Approved Vendor Panel for {client.shortName}:</p>
              <p className="text-slate-500 text-xs">Standard approved vendor list linked to contract requirements.</p>
            </div>
          )}
          {activeTab === 'templates' && (
            <div className="p-4 text-sm text-slate-600">
              <p className="font-medium text-slate-800 mb-2">Standard Formats & Templates:</p>
              <p className="text-slate-500 text-xs">LOA acceptance format, Joint Measurement Certificate (JMC) template, and DPR submission sheets.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ClientDetail;
