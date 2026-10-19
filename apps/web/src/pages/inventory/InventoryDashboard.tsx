import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PermissionGate } from '../../components/auth/PermissionGate';
import { ReadOnlyBanner } from '../../components/auth/ReadOnlyBanner';
import { usePermission } from '../../hooks/usePermission';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { Plus, Truck, FileCheck, AlertCircle, CheckCircle2, Clock, TrendingUp, Package, ArrowRight, Layers } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, CartesianGrid, Cell, PieChart, Pie
} from 'recharts';

// ─────────────────────────────────────────────────────────────────────────────
// BRD Stage 4: Dispatch Planning, ODC Permits, E-Way Bills, Store Setup
// Routes: /inventory  (InventoryDashboard)
// ─────────────────────────────────────────────────────────────────────────────

type DispatchStatus = 'Planned' | 'Loaded' | 'In Transit' | 'Arrived' | 'Short-landed';
type ODCStatus = 'Not Required' | 'Applied' | 'Approved' | 'Rejected' | 'Expired';

interface Dispatch {
  id: string; poNo: string; category: string; material: string;
  qty: number; uom: string; vehicleNo: string;
  fromPlant: string; toSite: string; project: string;
  dispatchDate: string; expectedArrival: string; actualArrival: string;
  odcRequired: boolean; odcStatus: ODCStatus; odcPermitNo: string;
  ewayBillNo: string; transitInsurance: string;
  status: DispatchStatus; driverContact: string;
}

const MOCK_DISPATCHES: Dispatch[] = [];

const STATUS_V: Record<string, string> = {
  Planned: 'secondary', Loaded: 'warning', 'In Transit': 'primary', Arrived: 'success', 'Short-landed': 'danger'
};
const ODC_V: Record<string, string> = {
  'Not Required': 'secondary', Applied: 'warning', Approved: 'success', Rejected: 'danger', Expired: 'danger'
};

const trendData = [
  { date:'Oct-1', planned:2, actual:2 }, { date:'Oct-5', planned:3, actual:3 }, { date:'Oct-10', planned:4, actual:4 },
  { date:'Oct-15', planned:5, actual:4 }, { date:'Oct-18', planned:6, actual:5 }, { date:'Oct-22', planned:7, actual:6 },
  { date:'Oct-25', planned:8, actual:null }, { date:'Oct-28', planned:9, actual:null }, { date:'Nov-1', planned:10, actual:null },
];

const catBreakdown = [
  { cat:'HTLS Conductor', value:35 }, { cat:'Tower', value:22 }, { cat:'Bay Equip', value:18 },
  { cat:'OPGW', value:12 }, { cat:'Insulators', value:8 }, { cat:'Others', value:5 }
];
const COLORS = ['#6366f1','#0891b2','#d97706','#059669','#7c3aed','#94a3b8'];

import { usePersistentState } from '../../hooks/usePersistentState';

export default function InventoryDashboard() {
  const navigate = useNavigate();
  const { canCreate } = usePermission('4.15');
  const [dispatches, setDispatches] = usePersistentState<Dispatch[]>('epc_inventory_dispatches', MOCK_DISPATCHES);
  const [projectsList] = usePersistentState<any[]>('epc_projects', []);
  const [activeTab, setActiveTab] = useState('dispatch');
  const [filterProject, setFilterProject] = useState('All');
  const [filterCat, setFilterCat] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showForm, setShowForm] = useState(false);

  const [newDispatchForm, setNewDispatchForm] = useState<Partial<Dispatch>>({
    poNo: 'PO-2026-001',
    category: 'HTLS Conductor',
    material: '',
    qty: 100,
    uom: 'km',
    vehicleNo: '',
    fromPlant: 'Silvassa',
    toSite: 'Site Warehouse',
    dispatchDate: new Date().toISOString().split('T')[0],
    expectedArrival: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
    actualArrival: '',
    status: 'In Transit',
    ewayBillNo: 'EWB-2026-001',
    transitInsurance: 'TIC-001',
    odcRequired: false,
    odcStatus: 'Not Required',
    odcPermitNo: '',
    driverContact: '',
    project: ''
  });

  const handleCreateDispatch = () => {
    if (!newDispatchForm.material || !newDispatchForm.vehicleNo) {
      alert('Please fill in Material Description and Vehicle No');
      return;
    }
    const proj = newDispatchForm.project || projectsList[0]?.name || 'Transmission Project';
    const created: Dispatch = {
      id: `DSP-${String(dispatches.length + 1).padStart(3, '0')}`,
      poNo: newDispatchForm.poNo || 'PO-2026-001',
      category: newDispatchForm.category || 'HTLS Conductor',
      material: newDispatchForm.material,
      qty: Number(newDispatchForm.qty) || 0,
      uom: newDispatchForm.uom || 'Nos',
      vehicleNo: newDispatchForm.vehicleNo,
      fromPlant: newDispatchForm.fromPlant || 'Silvassa',
      toSite: newDispatchForm.toSite || 'Site Warehouse',
      dispatchDate: newDispatchForm.dispatchDate || new Date().toISOString().split('T')[0],
      expectedArrival: newDispatchForm.expectedArrival || new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
      actualArrival: newDispatchForm.actualArrival || '',
      status: (newDispatchForm.status as any) || 'In Transit',
      ewayBillNo: newDispatchForm.ewayBillNo || 'EWB-NEW',
      transitInsurance: newDispatchForm.transitInsurance || 'TIC-001',
      odcRequired: !!newDispatchForm.odcRequired,
      odcStatus: newDispatchForm.odcRequired ? 'Applied' : 'Not Required',
      odcPermitNo: '',
      driverContact: newDispatchForm.driverContact || '+91-98765-00000',
      project: proj
    };
    setDispatches(prev => [created, ...prev]);
    setShowForm(false);
    setNewDispatchForm({
      poNo: 'PO-2026-001',
      category: 'HTLS Conductor',
      material: '',
      qty: 100,
      uom: 'km',
      vehicleNo: '',
      fromPlant: 'Silvassa',
      toSite: 'NTPC Lara Site',
      dispatchDate: new Date().toISOString().split('T')[0],
      expectedArrival: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
      actualArrival: '',
      status: 'In Transit',
      ewayBillNo: 'EWB-2026-001',
      transitInsurance: 'TIC-001',
      odcRequired: false,
      odcStatus: 'Not Required',
      odcPermitNo: '',
      driverContact: '',
      project: 'NTPC Lara 400kV'
    });
  };

  const projects = [...new Set(dispatches.map(d => d.project))];
  const cats = [...new Set(dispatches.map(d => d.category))];

  const filtered = useMemo(() => dispatches.filter(d =>
    (filterProject === 'All' || d.project === filterProject) &&
    (filterCat === 'All' || d.category === filterCat) &&
    (filterStatus === 'All' || d.status === filterStatus)
  ), [dispatches, filterProject, filterCat, filterStatus]);

  const arrived = dispatches.filter(d => d.status === 'Arrived').length;
  const inTransit = dispatches.filter(d => d.status === 'In Transit').length;
  const odcPending = dispatches.filter(d => d.odcRequired && d.odcStatus === 'Applied').length;
  const shortLanded = dispatches.filter(d => d.status === 'Short-landed').length;
  const onTime = dispatches.filter(d => d.status === 'Arrived' && d.actualArrival <= d.expectedArrival).length;
  const onTimePct = arrived > 0 ? Math.round((onTime / arrived) * 100) : 100;

  const tabs = [
    { id: 'dispatch', label: 'Dispatch Tracker' },
    { id: 'odc', label: 'ODC Permits & E-Way' },
    { id: 'analytics', label: 'Analytics' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dispatch Management (BRD §4.4–4.6)"
        description="Dispatch planning · ODC permits · E-way bills · Transit insurance · Store setup"
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/inventory')}
              className="flex items-center gap-1.5 text-xs font-semibold"
            >
              <Package size={14} />
              View Store & Stock Register →
            </Button>
            {canCreate && (
              <Button
                variant="primary"
                onClick={() => setShowForm(true)}
                className="flex items-center gap-1.5 text-xs font-semibold"
              >
                <Plus size={14} />
                + New Dispatch Plan
              </Button>
            )}
          </div>
        }
      />
      <ReadOnlyBanner moduleId="4.15" />

      {/* Sub-Navigation Quick Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        <Link
          to="/inventory"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition-colors shrink-0 shadow-sm"
        >
          <Package size={14} />
          Store & Stock Inventory
        </Link>
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700 shrink-0 shadow-sm">
          <Truck size={14} />
          Dispatch Planning & Transit
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'In Transit', value: inTransit, color: 'text-indigo-600 bg-indigo-50', icon: <Truck size={18}/> },
          { label: 'Arrived', value: arrived, color: 'text-green-600 bg-green-50', icon: <CheckCircle2 size={18}/> },
          { label: 'On-Time Dispatch %', value: onTimePct + '%', color: onTimePct >= 98 ? 'text-green-600 bg-green-50' : 'text-amber-600 bg-amber-50', icon: <TrendingUp size={18}/> },
          { label: 'ODC Pending', value: odcPending, color: odcPending > 0 ? 'text-red-600 bg-red-50' : 'text-slate-600 bg-slate-100', icon: <AlertCircle size={18}/> },
        ].map(k => (
          <Card key={k.label} className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${k.color}`}>{k.icon}</div>
            <div><p className="text-xs text-slate-500">{k.label}</p><p className="text-xl font-bold text-slate-800">{k.value}</p></div>
          </Card>
        ))}
      </div>

      {shortLanded > 0 && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-300 rounded-xl text-sm text-red-800">
          <AlertCircle size={18} className="text-red-600 shrink-0"/>
          <span><strong>{shortLanded} short-landing(s)</strong> detected. Raise short-supply NCR and update JVR immediately.</span>
        </div>
      )}

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab}/>

      {activeTab === 'dispatch' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            {[
              { val: filterProject, set: setFilterProject, label: 'All Projects', opts: projects },
              { val: filterCat, set: setFilterCat, label: 'All Categories', opts: cats },
              { val: filterStatus, set: setFilterStatus, label: 'All Statuses', opts: ['Planned', 'Loaded', 'In Transit', 'Arrived', 'Short-landed'] },
            ].map(f => (
              <select key={f.label} value={f.val} onChange={e => f.set(e.target.value)}
                className="border border-slate-200 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400">
                <option value="All">{f.label}</option>
                {f.opts.map(o => <option key={o}>{o}</option>)}
              </select>
            ))}
            <span className="ml-auto text-xs text-slate-400">{filtered.length}/{MOCK_DISPATCHES.length}</span>
            <Button onClick={() => setShowForm(true)} className="flex items-center gap-2 text-sm"><Plus size={14}/>Log Dispatch</Button>
          </div>
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>{['Dispatch ID','PO No.','Category','Material','Qty','Vehicle','From Plant','To Site','Dispatch Date','Expected Arrival','Actual Arrival','ODC','E-Way Bill','Insurance','Status'].map(h => (
                    <th key={h} className="px-3 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(d => {
                    const overdue = !d.actualArrival && d.expectedArrival < new Date().toISOString().slice(0,10);
                    return (
                      <tr key={d.id} className={`hover:bg-slate-50 ${d.status==='Short-landed'?'bg-red-50/40':overdue?'bg-amber-50/30':''}`}>
                        <td className="px-3 py-3 font-mono text-xs text-indigo-600">{d.id}</td>
                        <td className="px-3 py-3 text-xs text-slate-600">{d.poNo}</td>
                        <td className="px-3 py-3 text-xs text-slate-700">{d.category}</td>
                        <td className="px-3 py-3 text-xs text-slate-700 max-w-[130px] truncate" title={d.material}>{d.material}</td>
                        <td className="px-3 py-3 text-xs text-slate-600">{d.qty} {d.uom}</td>
                        <td className="px-3 py-3 text-xs font-mono text-slate-600">{d.vehicleNo||'—'}</td>
                        <td className="px-3 py-3 text-xs text-slate-500 max-w-[100px] truncate" title={d.fromPlant}>{d.fromPlant}</td>
                        <td className="px-3 py-3 text-xs text-slate-500 max-w-[100px] truncate" title={d.toSite}>{d.toSite}</td>
                        <td className="px-3 py-3 text-xs text-slate-500">{d.dispatchDate}</td>
                        <td className={`px-3 py-3 text-xs font-medium ${overdue?'text-red-600':'text-slate-500'}`}>{d.expectedArrival}{overdue?' ⚠️':''}</td>
                        <td className="px-3 py-3 text-xs text-slate-500">{d.actualArrival||'—'}</td>
                        <td className="px-3 py-3">{d.odcRequired ? <Badge variant={ODC_V[d.odcStatus] as any}>{d.odcStatus}</Badge> : <span className="text-xs text-slate-400">N/A</span>}</td>
                        <td className="px-3 py-3 text-xs font-mono text-slate-600">{d.ewayBillNo||'—'}</td>
                        <td className="px-3 py-3 text-xs text-slate-500">{d.transitInsurance||'—'}</td>
                        <td className="px-3 py-3"><Badge variant={STATUS_V[d.status] as any}>{d.status}</Badge></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'odc' && (
        <div className="space-y-4">
          <Card className="p-4 bg-amber-50 border border-amber-200 text-xs text-amber-800">
            <strong>ODC (Over-Dimensional Cargo) permits</strong> are required for towers, heavy transformers, and any cargo exceeding 4.5m height / 17m length / 40T weight. Permits must be obtained from state PWD/NHAI before dispatch. E-way bills must be generated within 24h of loading.
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">ODC Permit Status</h3>
              {dispatches.filter(d => d.odcRequired).map(d => (
                <div key={d.id} className={`flex items-center justify-between p-3 rounded-lg mb-2 border ${d.odcStatus==='Approved'?'bg-green-50 border-green-200':d.odcStatus==='Applied'?'bg-amber-50 border-amber-200':'bg-red-50 border-red-200'}`}>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{d.material}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{d.id} · {d.fromPlant} → {d.toSite.split(' ').slice(0,2).join(' ')}</p>
                    {d.odcPermitNo && <p className="text-[10px] text-indigo-600 mt-0.5 font-mono">{d.odcPermitNo}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={ODC_V[d.odcStatus] as any}>{d.odcStatus}</Badge>
                    {d.odcStatus === 'Applied' && (
                      <Button
                        onClick={() => {
                          setDispatches(prev => prev.map(item => item.id === d.id ? { ...item, odcStatus: 'Approved', odcPermitNo: `ODC-${Date.now().toString().slice(-4)}` } : item));
                          alert(`Follow-up sent for ODC permit on ${d.material}. Permit status updated to Approved!`);
                        }}
                        className="text-[10px] py-0.5 px-2"
                      >
                        Follow Up
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {dispatches.filter(d => d.odcRequired).length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">No ODC dispatches</p>
              )}
            </Card>
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">E-Way Bill Register</h3>
              <div className="space-y-2">
                {dispatches.filter(d => d.ewayBillNo).map(d => (
                  <div key={d.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div>
                      <p className="text-xs font-mono text-indigo-600">{d.ewayBillNo}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{d.material.slice(0,30)} · {d.qty} {d.uom}</p>
                    </div>
                    <Badge variant={STATUS_V[d.status] as any}>{d.status}</Badge>
                  </div>
                ))}
                {MOCK_DISPATCHES.filter(d => !d.ewayBillNo && d.status !== 'Planned').length > 0 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs text-red-700 font-semibold">⚠️ {MOCK_DISPATCHES.filter(d => !d.ewayBillNo && d.status !== 'Planned').length} dispatch(es) missing e-way bill!</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Cumulative Dispatches (Planned vs Actual)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData} margin={{top:4,right:8,left:-20,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                <XAxis dataKey="date" tick={{fontSize:10}}/>
                <YAxis tick={{fontSize:11}} allowDecimals={false}/>
                <Tooltip/><Legend/>
                <Line type="monotone" dataKey="planned" stroke="#94a3b8" name="Planned" strokeWidth={2} dot={false}/>
                <Line type="monotone" dataKey="actual" stroke="#6366f1" name="Actual" strokeWidth={2} dot={{r:3}} connectNulls={false}/>
              </LineChart>
            </ResponsiveContainer>
          </Card>
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Dispatch by Category (Value %)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={catBreakdown} dataKey="value" nameKey="cat" cx="50%" cy="50%" outerRadius={80} label={({cat,value})=>`${cat} ${value}%`}>
                  {catBreakdown.map((_,i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                </Pie>
                <Tooltip formatter={(v:any) => [`${v}%`]}/>
              </PieChart>
            </ResponsiveContainer>
          </Card>
          <Card className="p-5 md:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-700">BRD §4.5 On-Time Dispatch Compliance</h3>
              <span className={`text-2xl font-black ${onTimePct>=98?'text-green-600':'text-amber-600'}`}>{onTimePct}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-4 relative">
              <div className={`h-4 rounded-full transition-all ${onTimePct>=98?'bg-green-500':'bg-amber-500'}`} style={{width:`${onTimePct}%`}}/>
              <div className="absolute top-0 h-4 border-r-2 border-red-500 border-dashed" style={{left:'98%'}}/>
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>0%</span>
              <span className="text-red-600 font-semibold">BRD Benchmark: ≥98%</span>
              <span>100%</span>
            </div>
          </Card>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="p-6 w-full max-w-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-semibold text-slate-800">Log New Dispatch</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">×</button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">Target Project</label>
                <select
                  value={newDispatchForm.project || ''}
                  onChange={e => setNewDispatchForm(prev => ({ ...prev, project: e.target.value }))}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                >
                  <option value="">Select Project...</option>
                  {projectsList.map(p => (
                    <option key={p.id} value={p.name}>{p.name} ({p.id})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">PO Number</label>
                <input
                  type="text"
                  placeholder="PO-2026-XXX"
                  value={newDispatchForm.poNo}
                  onChange={e => setNewDispatchForm(prev => ({ ...prev, poNo: e.target.value }))}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  placeholder="e.g. HTLS Conductor"
                  value={newDispatchForm.category}
                  onChange={e => setNewDispatchForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">Material Description *</label>
                <input
                  type="text"
                  placeholder="Material specifications"
                  value={newDispatchForm.material}
                  onChange={e => setNewDispatchForm(prev => ({ ...prev, material: e.target.value }))}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Quantity</label>
                <input
                  type="number"
                  value={newDispatchForm.qty}
                  onChange={e => setNewDispatchForm(prev => ({ ...prev, qty: Number(e.target.value) || 0 }))}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">UOM</label>
                <input
                  type="text"
                  placeholder="km / MT / Nos"
                  value={newDispatchForm.uom}
                  onChange={e => setNewDispatchForm(prev => ({ ...prev, uom: e.target.value }))}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Vehicle No. *</label>
                <input
                  type="text"
                  placeholder="GJ-XX-XX-XXXX"
                  value={newDispatchForm.vehicleNo}
                  onChange={e => setNewDispatchForm(prev => ({ ...prev, vehicleNo: e.target.value }))}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Driver Contact</label>
                <input
                  type="text"
                  placeholder="+91-XXXXX-XXXXX"
                  value={newDispatchForm.driverContact}
                  onChange={e => setNewDispatchForm(prev => ({ ...prev, driverContact: e.target.value }))}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">From Plant</label>
                <input
                  type="text"
                  value={newDispatchForm.fromPlant}
                  onChange={e => setNewDispatchForm(prev => ({ ...prev, fromPlant: e.target.value }))}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">To Site</label>
                <input
                  type="text"
                  value={newDispatchForm.toSite}
                  onChange={e => setNewDispatchForm(prev => ({ ...prev, toSite: e.target.value }))}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Dispatch Date</label>
                <input
                  type="date"
                  value={newDispatchForm.dispatchDate}
                  onChange={e => setNewDispatchForm(prev => ({ ...prev, dispatchDate: e.target.value }))}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Expected Arrival</label>
                <input
                  type="date"
                  value={newDispatchForm.expectedArrival}
                  onChange={e => setNewDispatchForm(prev => ({ ...prev, expectedArrival: e.target.value }))}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">E-way Bill No.</label>
                <input
                  type="text"
                  placeholder="EWB-2026-XXXXX"
                  value={newDispatchForm.ewayBillNo}
                  onChange={e => setNewDispatchForm(prev => ({ ...prev, ewayBillNo: e.target.value }))}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Transit Insurance Ref</label>
                <input
                  type="text"
                  value={newDispatchForm.transitInsurance}
                  onChange={e => setNewDispatchForm(prev => ({ ...prev, transitInsurance: e.target.value }))}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                />
              </div>
              <div className="col-span-2 flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="odcReq"
                  checked={!!newDispatchForm.odcRequired}
                  onChange={e => setNewDispatchForm(prev => ({ ...prev, odcRequired: e.target.checked }))}
                  className="rounded text-indigo-600 focus:ring-indigo-400"
                />
                <label htmlFor="odcReq" className="text-sm text-slate-700">ODC Required? (Over-dimensional cargo)</label>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-3 border-t">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-slate-300 rounded text-slate-600 hover:bg-slate-50">Cancel</button>
              <Button onClick={handleCreateDispatch}>Log Dispatch</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
