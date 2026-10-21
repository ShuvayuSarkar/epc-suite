import React, { useState, useMemo } from 'react';
import { PermissionGate } from '../../components/auth/PermissionGate';
import { ReadOnlyBanner } from '../../components/auth/ReadOnlyBanner';
import { usePermission } from '../../hooks/usePermission';
import { ConfirmDeleteDialog } from '../../components/ui/ConfirmDeleteDialog';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { Plus, Package, Factory, Truck, Pencil, Trash2, X, CheckCircle2, AlertCircle, Clock, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell
} from 'recharts';

// ── Types ─────────────────────────────────────────────────────────────
type MatStatus = 'Not Started' | 'In Production' | 'Inspection Ready' | 'Dispatched' | 'Received' | 'Short-closed';
type ProdStatus = 'On Track' | 'Behind' | 'Ahead';
type DispStatus = 'Scheduled' | 'In Transit' | 'Arrived' | 'Short-landed';

interface POLineItem {
  id: string; poNo: string; headerNo: string; schLine: string;
  matCode: string; description: string; qty: number; uom: string; category: string;
  receiptAtSite: string; exWorks: string; inspectionDate: string;
  status: MatStatus; vendor: string; plant: string; ncrRaised: boolean;
  project: string; producedQty: number; plannedQty: number;
}

interface DispatchLog {
  dispatchId: string; poNo: string; material: string; qty: number;
  vehicleNo: string; fromPlant: string; toSite: string;
  dispatchDate: string; expectedArrival: string; odcPermit: string;
  ewayBill: string; transitInsurance: string; status: DispStatus; project: string; category: string;
  diNo?: string; // MSETCL DI / MDCC Number (Mandatory for utility dispatch clearance)
}

// ── Mock Data ─────────────────────────────────────────────────────────
const MOCK_ITEMS: POLineItem[] = [];

const MOCK_DISPATCHES: DispatchLog[] = [
  {
    dispatchId: 'DSP-101',
    poNo: 'PO-APAR-2026-001',
    diNo: 'MSETCL/SE/TR-400KV/DI-088',
    material: 'HTLS INVAR Conductor (Drum 1–4)',
    qty: 16,
    vehicleNo: 'MH-04-GP-8821',
    fromPlant: 'Apar Silvassa Works',
    toSite: 'MSETCL Central Site Store (Nagpur)',
    dispatchDate: '2026-10-18',
    expectedArrival: '2026-10-22',
    odcPermit: 'ODC-2026-8812',
    ewayBill: 'EWB-8819201948',
    transitInsurance: 'TIC-001',
    status: 'In Transit',
    project: '400kV Double Circuit Transmission Line',
    category: 'HTLS Conductor',
  },
  {
    dispatchId: 'DSP-102',
    poNo: 'PO-VEN-2026-008',
    diNo: 'MSETCL/SE/TR-400KV/DI-092',
    material: 'Tension Hardware Clamps 160kN',
    qty: 240,
    vehicleNo: 'GJ-06-TR-4512',
    fromPlant: 'Ensto Works (Halol)',
    toSite: 'MSETCL Central Site Store (Nagpur)',
    dispatchDate: '2026-10-19',
    expectedArrival: '2026-10-23',
    odcPermit: 'N/A',
    ewayBill: 'EWB-9920182741',
    transitInsurance: 'TIC-002',
    status: 'In Transit',
    project: '400kV Double Circuit Transmission Line',
    category: 'Hardware & Fittings',
  },
];

const trendData = [
  { date:'Oct-01', planned:10, actual:12 }, { date:'Oct-05', planned:25, actual:24 }, { date:'Oct-10', planned:40, actual:38 },
  { date:'Oct-15', planned:60, actual:55 }, { date:'Oct-20', planned:85, actual:80 }, { date:'Oct-25', planned:110, actual:null },
];

const CAT_COLORS = ['#6366f1','#0891b2','#d97706','#059669','#7c3aed','#94a3b8', '#ec4899', '#f43f5e'];
const STATUS_V: Record<string, string> = { 'Not Started':'secondary', 'In Production':'primary', 'Inspection Ready':'warning', Dispatched:'primary', Received:'success', 'Short-closed':'danger' };
const PROD_V: Record<string, string> = { 'On Track':'success', Behind:'danger', Ahead:'primary' };

import { usePersistentState } from '../../hooks/usePersistentState';

export default function POLineItemList() {
  const { canCreate, canUpdate, canRemove } = usePermission('4.14');
  const [items, setItems] = usePersistentState<POLineItem[]>('epc_po_items', MOCK_ITEMS);
  const [dispatches, setDispatches] = usePersistentState<DispatchLog[]>('epc_po_dispatches', MOCK_DISPATCHES);
  const [storedProjects] = usePersistentState<any[]>('epc_projects', []);
  const [editRow, setEditRow] = React.useState<POLineItem | null>(null);
  const [deleteRow, setDeleteRow] = React.useState<POLineItem | null>(null);
  const confirmDelete = () => {
    if (!deleteRow) return;
    setItems(prev => prev.filter(r => r.id !== deleteRow.id));
    setDeleteRow(null);
  };
  const [activeTab, setActiveTab] = useState('master');
  const [filterProject, setFilterProject] = useState('All');
  const [filterCat, setFilterCat] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);

  const [newLineItem, setNewLineItem] = useState<Partial<POLineItem>>({
    poNo: 'PO-2026-001',
    headerNo: 'H1',
    schLine: '10',
    matCode: '',
    description: '',
    qty: 100,
    uom: 'Nos',
    category: 'Hardware & Fittings',
    receiptAtSite: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    exWorks: new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0],
    inspectionDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
    status: 'In Production',
    vendor: 'Apar Industries',
    plant: 'Silvassa',
    ncrRaised: false,
    project: '',
    producedQty: 0,
    plannedQty: 100
  });

  const [newDispatch, setNewDispatch] = useState<Partial<DispatchLog>>({
    poNo: 'PO-2026-001',
    diNo: '',
    material: '',
    qty: 50,
    vehicleNo: '',
    fromPlant: 'Silvassa',
    toSite: 'Lara Site',
    dispatchDate: new Date().toISOString().split('T')[0],
    expectedArrival: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
    odcPermit: 'N/A',
    ewayBill: '',
    transitInsurance: 'TIC-001',
    status: 'In Transit',
    project: '',
    category: 'HTLS Conductor'
  });

  const handleCreateLineItem = () => {
    if (!newLineItem.matCode || !newLineItem.description) {
      alert('Please fill in Material Code and Description');
      return;
    }
    const created: POLineItem = {
      id: `POL-${String(items.length + 1).padStart(2, '0')}`,
      poNo: newLineItem.poNo || 'PO-2026-001',
      headerNo: newLineItem.headerNo || 'H1',
      schLine: newLineItem.schLine || '10',
      matCode: newLineItem.matCode,
      description: newLineItem.description,
      qty: Number(newLineItem.qty) || 0,
      uom: newLineItem.uom || 'Nos',
      category: newLineItem.category || 'Hardware & Fittings',
      receiptAtSite: newLineItem.receiptAtSite || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      exWorks: newLineItem.exWorks || new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0],
      inspectionDate: newLineItem.inspectionDate || new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
      status: (newLineItem.status as any) || 'In Production',
      vendor: newLineItem.vendor || 'Apar Industries',
      plant: newLineItem.plant || 'Silvassa',
      ncrRaised: false,
      project: newLineItem.project || (storedProjects[0]?.name || 'Transmission Project'),
      producedQty: Number(newLineItem.producedQty) || 0,
      plannedQty: Number(newLineItem.plannedQty) || Number(newLineItem.qty) || 0
    };
    setItems(prev => [created, ...prev]);
    setShowAddModal(false);
    setNewLineItem({
      poNo: 'PO-2026-001',
      headerNo: 'H1',
      schLine: '10',
      matCode: '',
      description: '',
      qty: 100,
      uom: 'Nos',
      category: 'Hardware & Fittings',
      receiptAtSite: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      exWorks: new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0],
      inspectionDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
      status: 'In Production',
      vendor: 'Apar Industries',
      plant: 'Silvassa',
      ncrRaised: false,
      project: storedProjects[0]?.name || '',
      producedQty: 0,
      plannedQty: 100
    });
  };

  const handleCreateDispatch = () => {
    if (!newDispatch.vehicleNo || !newDispatch.material) {
      alert('Please fill in Material and Vehicle No');
      return;
    }
    const created: DispatchLog = {
      dispatchId: `DSP-${String(dispatches.length + 101)}`,
      poNo: newDispatch.poNo || 'PO-2026-001',
      diNo: newDispatch.diNo || 'MSETCL/DI/PENDING',
      material: newDispatch.material,
      qty: Number(newDispatch.qty) || 0,
      vehicleNo: newDispatch.vehicleNo,
      fromPlant: newDispatch.fromPlant || 'Silvassa',
      toSite: newDispatch.toSite || 'Lara Site',
      dispatchDate: newDispatch.dispatchDate || new Date().toISOString().split('T')[0],
      expectedArrival: newDispatch.expectedArrival || new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
      odcPermit: newDispatch.odcPermit || 'N/A',
      ewayBill: newDispatch.ewayBill || 'EWB-NEW',
      transitInsurance: newDispatch.transitInsurance || 'TIC-001',
      status: (newDispatch.status as any) || 'In Transit',
      project: newDispatch.project || (storedProjects[0]?.name || 'Transmission Project'),
      category: newDispatch.category || 'Hardware & Fittings'
    };
    setDispatches(prev => [created, ...prev]);
    setShowDispatchModal(false);
    setNewDispatch({
      poNo: 'PO-2026-001',
      diNo: '',
      material: '',
      qty: 50,
      vehicleNo: '',
      fromPlant: 'Silvassa',
      toSite: 'Lara Site',
      dispatchDate: new Date().toISOString().split('T')[0],
      expectedArrival: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
      odcPermit: 'N/A',
      ewayBill: '',
      transitInsurance: 'TIC-001',
      status: 'In Transit',
      project: storedProjects[0]?.name || '',
      category: 'HTLS Conductor'
    });
  };

  const handleSaveEdit = () => {
    if (!editRow) return;
    setItems(prev => prev.map(i => i.id === editRow.id ? editRow : i));
    setEditRow(null);
  };

  const projects = useMemo(() => {
    const list = [...new Set([...items.map(i => i.project), ...storedProjects.map(p => p.name || p.projectName || p.id)])].filter(Boolean);
    return list.length > 0 ? list : ['Transmission Project'];
  }, [items, storedProjects]);
  const cats = [...new Set(items.map(i=>i.category))];

  const filteredItems = useMemo(() => items.filter(i=>
    (filterProject==='All' || i.project===filterProject) &&
    (filterCat==='All' || i.category===filterCat) &&
    (filterStatus==='All' || i.status===filterStatus)
  ), [items, filterProject, filterCat, filterStatus]);

  // KPIs
  const totalItems = items.length;
  const fullyDispatched = items.filter(i=>['Dispatched','Received'].includes(i.status)).length;
  const pendingDispatch = items.filter(i=>!['Dispatched','Received','Short-closed'].includes(i.status)).length;
  
  const todayStr = new Date().toISOString().slice(0,10);
  const overdueInspection = items.filter(i=> i.inspectionDate < todayStr && !['Inspection Ready','Dispatched','Received'].includes(i.status)).length;

  const totalPlanned = items.reduce((sum, i) => sum + i.plannedQty, 0);
  const totalProduced = items.reduce((sum, i) => sum + i.producedQty, 0);
  const prodEfficiency = totalPlanned > 0 ? Math.round((totalProduced / totalPlanned) * 100) : 100;

  const getProdStatus = (produced: number, planned: number): ProdStatus => {
    if (planned === 0 && produced === 0) return 'On Track';
    const ratio = produced / planned;
    if (ratio >= 1.05) return 'Ahead';
    if (ratio < 0.95) return 'Behind';
    return 'On Track';
  };

  const chartData = cats.map(c => {
    const itms = items.filter(i=>i.category===c);
    return {
      category: c.split(' ')[0],
      planned: itms.reduce((s,i)=>s+i.plannedQty,0),
      actual: itms.reduce((s,i)=>s+i.producedQty,0)
    };
  });

  const pieData = cats.map(c => ({ name: c, value: items.filter(i=>i.category===c).reduce((s,i)=>s+i.qty,0) }));

  return (
    <div className="space-y-6">
      <PageHeader title="PO / Material Line-Item Master (BRD §4.1, 4.4, 4.5)" description="Production tracking · Independent date tracking · Dispatch planning" />

      <Tabs tabs={[
        { id: 'master', label: 'Material Master' },
        { id: 'production', label: 'Production Tracking' },
        { id: 'dispatch', label: 'Dispatch Register' },
        { id: 'analytics', label: 'Analytics' }
      ]} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'master' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Package size={18}/></div>
              <div><p className="text-xs text-slate-500">Total Line Items</p><p className="text-xl font-bold">{totalItems}</p></div>
            </Card>
            <Card className="p-4 flex items-center gap-3">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg"><CheckCircle2 size={18}/></div>
              <div><p className="text-xs text-slate-500">Fully Dispatched</p><p className="text-xl font-bold">{fullyDispatched}</p></div>
            </Card>
            <Card className="p-4 flex items-center gap-3">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Factory size={18}/></div>
              <div><p className="text-xs text-slate-500">Pending Dispatch</p><p className="text-xl font-bold">{pendingDispatch}</p></div>
            </Card>
            <Card className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${overdueInspection>0?'bg-red-50 text-red-600':'bg-slate-50 text-slate-600'}`}><AlertCircle size={18}/></div>
              <div><p className="text-xs text-slate-500">Overdue Inspection</p><p className="text-xl font-bold">{overdueInspection}</p></div>
            </Card>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            {[
              { val: filterProject, set: setFilterProject, label: 'All Projects', opts: projects },
              { val: filterCat, set: setFilterCat, label: 'All Categories', opts: cats },
              { val: filterStatus, set: setFilterStatus, label: 'All Statuses', opts: ['Not Started','In Production','Inspection Ready','Dispatched','Received','Short-closed'] },
            ].map(f => (
              <select key={f.label} value={f.val} onChange={e => f.set(e.target.value)}
                className="border border-slate-200 rounded px-3 py-2 text-sm bg-white">
                <option value="All">{f.label}</option>
                {f.opts.map(o => <option key={o}>{o}</option>)}
              </select>
            ))}
            <div className="ml-auto">
              {canCreate && (
                <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 text-sm">
                  <Plus size={14}/> Add Line Item
                </Button>
              )}
            </div>
          </div>

          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>{['PO No.','Sch','Material Code','Description','Category','Qty','Inspection Date','Ex-Works Date','Receipt at Site','Status','Actions'].map(h => (
                    <th key={h} className="px-3 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map(i => {
                    const isInspOverdue = i.inspectionDate < todayStr && !['Inspection Ready','Dispatched','Received'].includes(i.status);
                    const daysToExWorks = Math.round((new Date(i.exWorks).getTime() - new Date().getTime())/86400000);
                    const isExWorksSoon = daysToExWorks >= 0 && daysToExWorks <= 7 && !['Dispatched','Received'].includes(i.status);
                    
                    return (
                      <React.Fragment key={i.id}>
                        <tr onClick={() => setExpandedRow(expandedRow === i.id ? null : i.id)} className={`cursor-pointer hover:bg-slate-50 ${isInspOverdue ? 'bg-red-50/30' : isExWorksSoon ? 'bg-amber-50/20' : ''}`}>
                          <td className="px-3 py-3 font-mono text-xs text-indigo-600">{i.poNo}</td>
                          <td className="px-3 py-3 text-xs text-slate-500">{i.schLine}</td>
                          <td className="px-3 py-3 font-mono text-xs text-slate-700">{i.matCode}</td>
                          <td className="px-3 py-3 text-xs text-slate-800 font-medium truncate max-w-[150px]">{i.description}</td>
                          <td className="px-3 py-3 text-[10px] text-slate-500">{i.category}</td>
                          <td className="px-3 py-3 text-xs font-semibold text-slate-700">{i.qty} {i.uom}</td>
                          <td className={`px-3 py-3 text-xs ${isInspOverdue ? 'text-red-600 font-bold' : 'text-slate-500'}`}>{i.inspectionDate} {isInspOverdue && '⚠️'}</td>
                          <td className={`px-3 py-3 text-xs ${isExWorksSoon ? 'text-amber-600 font-bold' : 'text-slate-500'}`}>{i.exWorks}</td>
                          <td className="px-3 py-3 text-xs text-slate-500">{i.receiptAtSite}</td>
                          <td className="px-3 py-3"><Badge variant={STATUS_V[i.status] as any}>{i.status}</Badge></td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                              {canUpdate && (
                                <button onClick={() => setEditRow(i)} className="p-1 rounded text-slate-400 hover:text-indigo-600">
                                  <Pencil size={13} />
                                </button>
                              )}
                              {canRemove && (
                                <button onClick={() => setDeleteRow(i)} className="p-1 rounded text-slate-400 hover:text-red-600">
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                        {expandedRow === i.id && (
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <td colSpan={11} className="px-4 py-3">
                              <div className="grid grid-cols-4 gap-4 text-xs">
                                <div><span className="text-slate-500 block mb-1">Vendor & Plant</span><span className="font-semibold text-slate-800">{i.vendor} ({i.plant})</span></div>
                                <div><span className="text-slate-500 block mb-1">Project</span><span className="font-medium text-slate-800">{i.project}</span></div>
                                <div><span className="text-slate-500 block mb-1">Production Progress</span>
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-slate-200 h-2 rounded-full"><div className="bg-indigo-500 h-2 rounded-full" style={{width: `${i.qty>0 ? (i.producedQty/i.qty)*100 : 0}%`}}/></div>
                                    <span>{i.producedQty}/{i.qty}</span>
                                  </div>
                                </div>
                                <div><span className="text-slate-500 block mb-1">NCR Raised?</span>{i.ncrRaised ? <span className="text-red-600 font-bold flex items-center gap-1"><AlertCircle size={14}/> Yes</span> : <span className="text-green-600">No</span>}</div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'production' && (
        <div className="space-y-4">
          <Card className="p-4 bg-blue-50 border border-blue-200 text-xs text-blue-700 flex justify-between items-center">
            <span><strong>BRD §4.1 Benchmark:</strong> Production tracking vs L2 schedule must maintain ≥95% efficiency.</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Current Efficiency:</span>
              <span className={`text-lg font-black ${prodEfficiency >= 95 ? 'text-green-600' : 'text-red-600'}`}>{prodEfficiency}%</span>
            </div>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Planned vs Actual Production (by Category)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} margin={{top:4,right:8,left:-20,bottom:0}}>
                  <XAxis dataKey="category" tick={{fontSize:10}} />
                  <YAxis tick={{fontSize:11}} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="planned" fill="#94a3b8" name="Planned Qty" />
                  <Bar dataKey="actual" fill="#6366f1" name="Produced Qty" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">30-Day Production Trend (Equiv. Units)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trendData} margin={{top:4,right:8,left:-20,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                  <XAxis dataKey="date" tick={{fontSize:10}}/>
                  <YAxis tick={{fontSize:11}}/>
                  <Tooltip/><Legend/>
                  <Line type="monotone" dataKey="planned" stroke="#94a3b8" name="Planned" strokeWidth={2} dot={false}/>
                  <Line type="monotone" dataKey="actual" stroke="#059669" name="Actual" strokeWidth={2}/>
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Card className="p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>{['Material Code','Description','Total Qty','Produced Qty','% Complete','Status vs L2','Plant'].map(h => (
                  <th key={h} className="px-3 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MOCK_ITEMS.filter(i=>!['Dispatched','Received','Short-closed'].includes(i.status)).map(i => {
                  const pct = i.qty > 0 ? Math.round((i.producedQty / i.qty) * 100) : 0;
                  const prodStat = getProdStatus(i.producedQty, i.plannedQty);
                  return (
                    <tr key={i.id} className="hover:bg-slate-50">
                      <td className="px-3 py-3 font-mono text-xs text-indigo-600">{i.matCode}</td>
                      <td className="px-3 py-3 text-xs text-slate-800">{i.description}</td>
                      <td className="px-3 py-3 text-xs text-slate-500">{i.qty} {i.uom}</td>
                      <td className="px-3 py-3 text-xs font-semibold text-slate-700">{i.producedQty} {i.uom}</td>
                      <td className="px-3 py-3 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-200 rounded-full h-1.5"><div className="bg-indigo-500 h-1.5 rounded-full" style={{width:`${pct}%`}}/></div>
                          <span>{pct}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-3"><Badge variant={PROD_V[prodStat] as any}>{prodStat}</Badge></td>
                      <td className="px-3 py-3 text-xs text-slate-500">{i.plant}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {activeTab === 'dispatch' && (
        <div className="space-y-4">
          <Card className="p-4 bg-indigo-50 border border-indigo-200 text-xs text-indigo-800">
            <strong>Dispatch Planning (BRD §4.4, 4.5):</strong> Mode, insurance, schedule, drum-wise tracking, and ODC permit mapping.
          </Card>
          <div className="flex justify-end">
            {canCreate && (
              <Button onClick={() => setShowDispatchModal(true)} className="flex items-center gap-2 text-sm">
                <Truck size={14}/> Log Dispatch
              </Button>
            )}
          </div>
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>{['Dispatch ID','PO No.','Utility DI / MDCC #','Material','Qty','Vehicle','Route','Dispatch Date','ETA','ODC Permit','E-Way Bill','Status'].map(h => (
                    <th key={h} className="px-3 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dispatches.map(d => (
                    <tr key={d.dispatchId} className="hover:bg-slate-50">
                      <td className="px-3 py-3 font-mono text-xs text-indigo-600">{d.dispatchId}</td>
                      <td className="px-3 py-3 text-xs text-slate-500">{d.poNo}</td>
                      <td className="px-3 py-3 font-mono text-xs text-indigo-700 font-semibold">
                        {d.diNo ? (
                          <span className="bg-indigo-50 border border-indigo-200 text-indigo-800 px-1.5 py-0.5 rounded text-[11px]">
                            {d.diNo}
                          </span>
                        ) : (
                          <span className="bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded text-[10px]">
                            DI Pending
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-xs text-slate-800">{d.material}</td>
                      <td className="px-3 py-3 text-xs font-semibold">{d.qty}</td>
                      <td className="px-3 py-3 text-xs font-mono">{d.vehicleNo}</td>
                      <td className="px-3 py-3 text-[10px] text-slate-500">{d.fromPlant} → {d.toSite}</td>
                      <td className="px-3 py-3 text-xs text-slate-500">{d.dispatchDate}</td>
                      <td className="px-3 py-3 text-xs font-medium text-slate-700">{d.expectedArrival}</td>
                      <td className={`px-3 py-3 text-xs ${d.odcPermit==='N/A'?'text-slate-400':'font-mono text-indigo-600'}`}>{d.odcPermit}</td>
                      <td className="px-3 py-3 text-xs font-mono text-slate-600">{d.ewayBill}</td>
                      <td className="px-3 py-3">
                        <Badge variant={d.status==='Arrived'?'success':d.status==='In Transit'?'primary':'secondary'}>{d.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Category Split by Value/Volume</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({name, percent})=>`${name} ${(percent*100).toFixed(0)}%`}>
                  {pieData.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Dispatch SLA Compliance</h3>
            <div className="flex flex-col items-center justify-center h-full space-y-4 pb-6">
              <div className="relative w-48 h-48 rounded-full border-8 border-slate-100 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle cx="96" cy="96" r="88" fill="none" stroke="#22c55e" strokeWidth="16" strokeDasharray={`${Math.PI*176*0.92} ${Math.PI*176}`} />
                </svg>
                <div className="text-center">
                  <span className="text-4xl font-black text-green-600">92%</span>
                  <p className="text-xs text-slate-500 mt-1">On-Time Dispatch</p>
                </div>
              </div>
              <p className="text-sm text-red-600 font-semibold">BRD Benchmark: ≥98%</p>
            </div>
          </Card>
        </div>
      )}

      <ConfirmDeleteDialog open={!!deleteRow} recordName={deleteRow ? deleteRow.id : ''} recordType="PO line item" onConfirm={confirmDelete} onCancel={() => setDeleteRow(null)} />
      
      {/* Edit PO Line Item Modal */}
      {editRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Edit PO Line Item — {editRow.id}</h3>
              <button onClick={() => setEditRow(null)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">PO Number</label>
                  <input
                    value={editRow.poNo}
                    onChange={e => setEditRow({ ...editRow, poNo: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Material Code</label>
                  <input
                    value={editRow.matCode}
                    onChange={e => setEditRow({ ...editRow, matCode: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                <input
                  value={editRow.description}
                  onChange={e => setEditRow({ ...editRow, description: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Qty</label>
                  <input
                    type="number"
                    value={editRow.qty}
                    onChange={e => setEditRow({ ...editRow, qty: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
                  <select
                    value={editRow.status}
                    onChange={e => setEditRow({ ...editRow, status: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                  >
                    {['Not Started','In Production','Inspection Ready','Dispatched','Received','Short-closed'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Vendor</label>
                <input
                  value={editRow.vendor}
                  onChange={e => setEditRow({ ...editRow, vendor: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-200">
              <button onClick={() => setEditRow(null)} className="flex-1 px-4 py-2 text-sm text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={handleSaveEdit} className="flex-1 px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Line Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Add PO Line Item</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">PO Number</label>
                  <input
                    value={newLineItem.poNo || ''}
                    onChange={e => setNewLineItem({ ...newLineItem, poNo: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Material Code *</label>
                  <input
                    value={newLineItem.matCode || ''}
                    onChange={e => setNewLineItem({ ...newLineItem, matCode: e.target.value })}
                    placeholder="e.g. MAT-CON-03"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Description *</label>
                <input
                  value={newLineItem.description || ''}
                  onChange={e => setNewLineItem({ ...newLineItem, description: e.target.value })}
                  placeholder="e.g. Earthwire 7/3.15 Galvanized"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={newLineItem.qty || 0}
                    onChange={e => setNewLineItem({ ...newLineItem, qty: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">UoM</label>
                  <input
                    value={newLineItem.uom || ''}
                    onChange={e => setNewLineItem({ ...newLineItem, uom: e.target.value })}
                    placeholder="km / MT / Nos"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
                  <select
                    value={newLineItem.category}
                    onChange={e => setNewLineItem({ ...newLineItem, category: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                  >
                    {cats.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Vendor</label>
                  <input
                    value={newLineItem.vendor || ''}
                    onChange={e => setNewLineItem({ ...newLineItem, vendor: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Project</label>
                  <select
                    value={newLineItem.project}
                    onChange={e => setNewLineItem({ ...newLineItem, project: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                  >
                    {projects.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-200">
              <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 text-sm text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={handleCreateLineItem} className="flex-1 px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Add Line Item</button>
            </div>
          </div>
        </div>
      )}

      {/* Log Dispatch Modal */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Log Material Dispatch</h3>
              <button onClick={() => setShowDispatchModal(false)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">PO Number</label>
                  <input
                    value={newDispatch.poNo || ''}
                    onChange={e => setNewDispatch({ ...newDispatch, poNo: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Material *</label>
                  <input
                    value={newDispatch.material || ''}
                    onChange={e => setNewDispatch({ ...newDispatch, material: e.target.value })}
                    placeholder="e.g. HTLS Conductor"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="bg-indigo-50/60 p-3 rounded-lg border border-indigo-200">
                <label className="block text-xs font-bold text-indigo-900 mb-1">
                  Utility DI / MDCC Number * <span className="text-slate-500 font-normal">(e.g. MSETCL/SE/TR-400KV/DI-088)</span>
                </label>
                <input
                  value={newDispatch.diNo || ''}
                  onChange={e => setNewDispatch({ ...newDispatch, diNo: e.target.value })}
                  placeholder="Enter official Utility Dispatch Instruction / MDCC number"
                  className="w-full border border-indigo-300 rounded-lg px-3 py-2 text-sm font-mono bg-white"
                />
                <p className="text-[11px] text-indigo-700 mt-1">
                  Mandatory for utility transmission gate passes. Issued after joint FAT approval.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={newDispatch.qty || 0}
                    onChange={e => setNewDispatch({ ...newDispatch, qty: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Vehicle No. *</label>
                  <input
                    value={newDispatch.vehicleNo || ''}
                    onChange={e => setNewDispatch({ ...newDispatch, vehicleNo: e.target.value })}
                    placeholder="e.g. MH-04-AB-1234"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">From Plant</label>
                  <input
                    value={newDispatch.fromPlant || ''}
                    onChange={e => setNewDispatch({ ...newDispatch, fromPlant: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">To Site</label>
                  <input
                    value={newDispatch.toSite || ''}
                    onChange={e => setNewDispatch({ ...newDispatch, toSite: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Dispatch Date</label>
                  <input
                    type="date"
                    value={newDispatch.dispatchDate || ''}
                    onChange={e => setNewDispatch({ ...newDispatch, dispatchDate: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Expected Arrival</label>
                  <input
                    type="date"
                    value={newDispatch.expectedArrival || ''}
                    onChange={e => setNewDispatch({ ...newDispatch, expectedArrival: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-200">
              <button onClick={() => setShowDispatchModal(false)} className="flex-1 px-4 py-2 text-sm text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={handleCreateDispatch} className="flex-1 px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Log Dispatch</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}