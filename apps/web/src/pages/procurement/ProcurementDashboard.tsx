import React, { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatsCard } from '../../components/ui/StatsCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ShoppingCart, Truck, CheckCircle2, Layers, Plus, ExternalLink, ArrowRight, FileText, CheckSquare, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { usePersistentState } from '../../hooks/usePersistentState';
import { usePermission } from '../../hooks/usePermission';
import { useAuth } from '../../contexts/AuthContext';
import { ModuleId, canView } from '../../config/rbac';

const initialCategories = [
  { name: 'Tower Parts', vendor: 'Y', po: 12, delivery: '75%' },
  { name: 'Conductor', vendor: 'Y', po: 8, delivery: '90%' },
  { name: 'Insulators', vendor: 'Y', po: 5, delivery: '40%' },
  { name: 'Hardware Fittings', vendor: 'Y', po: 15, delivery: '60%' },
  { name: 'Transformers', vendor: 'Y', po: 2, delivery: '10%' },
  { name: 'Switchgear', vendor: 'N', po: 0, delivery: '0%' },
  { name: 'Cables & Accessories', vendor: 'Y', po: 18, delivery: '85%' },
  { name: 'Control Panels', vendor: 'Y', po: 4, delivery: '30%' },
  { name: 'Steel Structures', vendor: 'Y', po: 6, delivery: '55%' },
  { name: 'Earth Wire / OPGW', vendor: 'Y', po: 3, delivery: '100%' },
  { name: 'Cement & Steel (Civil)', vendor: 'Y', po: 25, delivery: '95%' },
  { name: 'Testing Equipments', vendor: 'N', po: 0, delivery: '0%' },
];

const initialPoTracker = [
  { po: 'PO-24-1045', vendor: 'Apar Industries', item: 'HTLS Conductor', amount: '₹12.5 Cr', date: '15 Jan 2024', status: 'Delivered' },
  { po: 'PO-24-1048', vendor: 'Sterlite Power', item: 'OPGW Cable', amount: '₹4.2 Cr', date: '28 Feb 2024', status: 'In Transit' },
  { po: 'PO-24-1052', vendor: 'KEC International', item: 'Tower Parts', amount: '₹18.0 Cr', date: '10 Mar 2024', status: 'Manufacturing' },
  { po: 'PO-24-1055', vendor: 'Bajaj Electricals', item: 'Illumination', amount: '₹1.5 Cr', date: '05 Apr 2024', status: 'PO Issued' },
  { po: 'PO-24-1060', vendor: 'L&T Construction', item: 'Switchyard Eq.', amount: '₹22.4 Cr', date: '12 Apr 2024', status: 'Pending Approval' },
];

export default function ProcurementDashboard() {
  const navigate = useNavigate();
  const { getEffectivePermission } = useAuth();
  const { canCreate } = usePermission('4.14');
  const [pos] = usePersistentState<any[]>('epc_pos', initialPoTracker);
  const [vendors] = usePersistentState<any[]>('epc_vendors', []);

  const totalPosCount = pos.length > 5 ? pos.length : 1245;
  const pendingCount = pos.filter(p => p.status !== 'Delivered' && p.status !== 'DELIVERED').length;
  const pendingDisplay = pos.length > 5 ? String(pendingCount) : '482';

  const vendorPerformance = useMemo(() => {
    if (vendors.length > 0) {
      return vendors.slice(0, 5).map(v => ({
        name: v.name || v.vendorName || 'Vendor',
        score: Number(v.overallScore || v.deliveryRating * 20 || 85)
      }));
    }
    return [
      { name: 'Apar Industries', score: 95 },
      { name: 'Sterlite Power', score: 92 },
      { name: 'KEC International', score: 88 },
      { name: 'Bajaj Electricals', score: 85 },
      { name: 'L&T', score: 82 },
    ];
  }, [vendors]);

  const recentPos = useMemo(() => {
    return pos.slice(0, 10).map((p, idx) => ({
      po: p.poNumber || p.po || p.id || `PO-24-10${idx + 40}`,
      vendor: p.vendorName || p.vendor || 'Vendor',
      item: p.itemDescription || p.item || 'Material Package',
      amount: typeof p.amount === 'number' ? `₹${(p.amount / 10000000).toFixed(2)} Cr` : (p.amount || '₹2.5 Cr'),
      date: p.date || p.poDate || 'Recent',
      status: p.status || 'Active'
    }));
  }, [pos]);

  return (
    <div className="space-y-6">
      {/* Header with Title and Creation Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <PageHeader 
          title="Procurement & Supply Chain" 
          subtitle="Vendor management, Purchase Orders, PO line item dispatch tracking and factory clearances"
        />
        <div className="flex items-center gap-3">
          {canCreate && (
            <>
              <Button 
                onClick={() => navigate('/procurement/vendors')} 
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Plus size={16} /> Add / Manage Vendors
              </Button>
              <Button 
                onClick={() => navigate('/procurement/purchase-orders')} 
                variant="outline"
                className="flex items-center gap-2"
              >
                <Plus size={16} /> Issue Purchase Order
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Sub-Navigation Quick Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {[
          { label: 'Vendors Master', href: '/procurement/vendors', icon: <Layers size={14} />, moduleId: '4.14' as ModuleId },
          { label: 'Purchase Orders', href: '/procurement/purchase-orders', icon: <ShoppingCart size={14} />, moduleId: '4.14' as ModuleId },
          { label: 'PO Line Items & Dispatch', href: '/po-line-items', icon: <Truck size={14} />, moduleId: '4.14' as ModuleId },
          { label: 'PO Amendments', href: '/po-amendments', icon: <FileText size={14} />, moduleId: '4.8' as ModuleId },
          { label: 'Vendor Finalization (Stage 2)', href: '/golden-period/vendor-finalization', icon: <CheckSquare size={14} />, moduleId: '4.14' as ModuleId },
          { label: 'Mfg. Clearance / LOI', href: '/golden-period/manufacturing-clearance', icon: <Award size={14} />, moduleId: '4.14' as ModuleId },
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
        <StatsCard title="Total POs (YTD)" value={String(totalPosCount)} icon={<ShoppingCart className="text-indigo-500" />} />
        <StatsCard title="Pending Delivery" value={pendingDisplay} icon={<Truck className="text-amber-500" />} />
        <StatsCard title="On-Time Delivery %" value="88%" icon={<CheckCircle2 className="text-emerald-500" />} trend="Target: 90%" trendPositive={false} />
        <StatsCard title="Category Coverage" value="10/12" icon={<Layers className="text-blue-500" />} trend="83% covered" trendPositive={true} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 12-Category Status */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">12-Category Material Status</h3>
            <Link 
              to="/golden-period/vendor-finalization" 
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Stage 2 Finalization Matrix <ArrowRight size={13} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {initialCategories.map((cat, i) => (
              <div 
                key={i} 
                onClick={() => navigate('/procurement/vendors')}
                className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${cat.vendor === 'Y' ? 'bg-white border-slate-200' : 'bg-slate-50 border-dashed border-slate-300'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-slate-800 truncate" title={cat.name}>{cat.name}</h4>
                  <ExternalLink size={12} className="text-slate-400 shrink-0" />
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                  <span>Vendor:</span>
                  <span className={cat.vendor === 'Y' ? 'text-emerald-600 font-bold' : 'text-rose-500 font-bold'}>{cat.vendor === 'Y' ? 'Selected' : 'Pending'}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
                  <span>Active POs:</span>
                  <span className="font-semibold text-slate-700">{cat.po}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                  <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: cat.delivery }}></div>
                </div>
                <p className="text-[10px] text-right text-slate-400 mt-1">{cat.delivery} Delivered</p>
              </div>
            ))}
          </div>
        </div>

        {/* Vendor Performance */}
        <Card className="p-4 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Top Vendor Performance</h3>
            <Link to="/procurement/vendors" className="text-xs font-medium text-indigo-600 hover:underline">
              View All Vendors
            </Link>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vendorPerformance} layout="vertical" margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} fontSize={12} />
                <YAxis dataKey="name" type="category" fontSize={11} width={80} />
                <RechartsTooltip />
                <Bar dataKey="score" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* PO Tracker */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center flex-wrap gap-2">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Purchase Order Tracker (Recent)</h3>
            <span className="text-xs text-slate-500">{pos.length} total orders recorded</span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => navigate('/po-line-items')}
              className="text-xs flex items-center gap-1.5"
            >
              Track Line Items <ArrowRight size={13} />
            </Button>
            <Button 
              size="sm" 
              onClick={() => navigate('/procurement/purchase-orders')}
              className="text-xs flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              View Full PO Register <ArrowRight size={13} />
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
              <tr>
                <th className="px-4 py-3">PO Number</th>
                <th className="px-4 py-3">Vendor</th>
                <th className="px-4 py-3">Item Description</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">PO Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentPos.map((po, i) => (
                <tr key={i} className="border-b hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-indigo-600">{po.po}</td>
                  <td className="px-4 py-3 font-medium">{po.vendor}</td>
                  <td className="px-4 py-3 text-slate-700">{po.item}</td>
                  <td className="px-4 py-3 font-medium">{po.amount}</td>
                  <td className="px-4 py-3 text-slate-500">{po.date}</td>
                  <td className="px-4 py-3">
                    <Badge variant={
                      po.status === 'Delivered' || po.status === 'DELIVERED' ? 'outline' : 
                      po.status === 'Pending Approval' ? 'default' : 'secondary'
                    } className={po.status === 'Delivered' || po.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}>
                      {po.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => navigate('/procurement/purchase-orders')}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      View Details →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
