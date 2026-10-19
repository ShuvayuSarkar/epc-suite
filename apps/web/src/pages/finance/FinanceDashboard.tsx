import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatsCard } from '../../components/ui/StatsCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { IndianRupee, FileText, CheckCircle2, AlertCircle, TrendingUp, DollarSign, ArrowRight, Plus, Layers, PieChart as PieIcon } from 'lucide-react';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import EarnedValueCurve from '../../components/charts/EarnedValueCurve';
import { usePersistentState } from '../../hooks/usePersistentState';
import { usePermission } from '../../hooks/usePermission';

const defaultBudgetData = [
  { name: 'Manufacturing', Budget: 450, Actual: 410 },
  { name: 'Procurement', Budget: 300, Actual: 280 },
  { name: 'Installation', Budget: 200, Actual: 215 },
  { name: 'Commissioning', Budget: 50, Actual: 45 },
];

const cashFlowData = [
  { month: 'Jan', Inflow: 45, Outflow: 30 },
  { month: 'Feb', Inflow: 50, Outflow: 40 },
  { month: 'Mar', Inflow: 65, Outflow: 45 },
  { month: 'Apr', Inflow: 40, Outflow: 55 },
  { month: 'May', Inflow: 85, Outflow: 60 },
  { month: 'Jun', Inflow: 90, Outflow: 75 },
];

const evmData = [
  { period: "Jun'26", pv: 15000000, ev: 14000000, ac: 13500000 },
  { period: "Jul'26", pv: 35000000, ev: 32000000, ac: 34000000 },
  { period: "Aug'26", pv: 60000000, ev: 58000000, ac: 59000000 },
  { period: "Sep'26", pv: 85000000, ev: 82000000, ac: 80500000 },
  { period: "Oct'26", pv: 105000000, ev: 98000000, ac: 96000000 },
  { period: "Nov'26", pv: 112000000, ev: 0, ac: 0 },
];

export default function FinanceDashboard() {
  const navigate = useNavigate();
  const { canCreate } = usePermission('4.7');
  const [bills] = usePersistentState<any[]>('epc_bills', []);
  const [budgets] = usePersistentState<any[]>('epc_budgets', []);

  const parseAmountToCr = (val: any): number => {
    if (typeof val === 'number') return val > 1000000 ? val / 10000000 : val;
    if (typeof val === 'string') {
      const num = parseFloat(val.replace(/[^\d.]/g, '')) || 0;
      if (val.includes('Cr')) return num;
      if (val.includes('Lakh') || val.includes('L')) return num / 100;
      return num / 10000000;
    }
    return 0;
  };

  const totalBillsVal = bills.reduce((acc, b) => acc + parseAmountToCr(b.net || b.netAmount || b.amount), 0) || 234.5;
  const paidBills = bills.filter(b => b.status === 'Paid');
  const paidVal = paidBills.reduce((acc, b) => acc + parseAmountToCr(b.net || b.netAmount || b.amount), 0) || 198.2;
  const pendingBills = bills.filter(b => b.status === 'Pending' || b.status === 'UNDER_VERIFICATION');
  const pendingVal = pendingBills.reduce((acc, b) => acc + parseAmountToCr(b.net || b.netAmount || b.amount), 0) || 24.8;
  const overdueBills = bills.filter(b => b.status === 'Overdue' || b.status === 'DISPUTED');
  const overdueVal = overdueBills.reduce((acc, b) => acc + parseAmountToCr(b.net || b.netAmount || b.amount), 0) || 11.5;

  const displayBills = bills.length > 0 ? bills.slice(0, 8) : [
    { id: 'BL-2024-001', vendor: 'Apar Industries', po: 'PO-1042', amount: '₹12,45,000', tds: '₹24,900', gst: '₹2,24,100', net: '₹14,44,200', status: 'Paid', stage: 'Completed', date: '10 May 2024' },
    { id: 'BL-2024-002', vendor: 'Sterlite Power', po: 'PO-1045', amount: '₹8,30,000', tds: '₹16,600', gst: '₹1,49,400', net: '₹9,62,800', status: 'Pending', stage: 'Finance Approval', date: '12 May 2024' },
    { id: 'BL-2024-003', vendor: 'KEC International', po: 'PO-1048', amount: '₹45,00,000', tds: '₹90,000', gst: '₹8,10,000', net: '₹52,20,000', status: 'Overdue', stage: 'Payment Processing', date: '28 Apr 2024' },
    { id: 'BL-2024-004', vendor: 'L&T Construction', po: 'PO-1050', amount: '₹1,12,00,000', tds: '₹2,24,000', gst: '₹20,16,000', net: '₹1,29,92,000', status: 'Pending', stage: 'Site Verification', date: '15 May 2024' },
    { id: 'BL-2024-005', vendor: 'Kalpataru Projects', po: 'PO-1052', amount: '₹25,50,000', tds: '₹51,000', gst: '₹4,59,000', net: '₹29,58,000', status: 'Paid', stage: 'Completed', date: '05 May 2024' },
  ];

  const budgetData = budgets.length > 0 ? budgets.map(b => ({
    name: b.name || b.category || 'Package',
    Budget: Number(b.budget) || 100,
    Actual: Number(b.actual) || 90
  })) : defaultBudgetData;

  return (
    <div className="space-y-6">
      {/* Header with Title and Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <PageHeader
          title="Finance & Cost Control Dashboard"
          subtitle="Earned Value Management (EVM), Cash Flow Curves, and Contractor Billing Overview"
        />
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => navigate('/finance/bills')} 
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <FileText size={15} /> Contractor Bills Register <ArrowRight size={15}/>
          </Button>
          <Button 
            onClick={() => navigate('/finance/budgets')} 
            variant="outline"
            className="flex items-center gap-1.5"
          >
            <PieIcon size={15} /> {canCreate ? 'Manage Budgets' : 'View Budgets'} <ArrowRight size={15}/>
          </Button>
        </div>
      </div>

      {/* Sub-Navigation Quick Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {[
          { label: 'Finance Overview', href: '/finance', icon: <DollarSign size={14} /> },
          { label: 'Contractor Bills Register', href: '/finance/bills', icon: <FileText size={14} /> },
          { label: 'Budget & Cost Packages', href: '/finance/budgets', icon: <Layers size={14} /> },
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
        <StatsCard 
          title="Total Bills Registered" 
          value={`₹${totalBillsVal.toFixed(1)} Cr`} 
          trend={`${bills.length} bills recorded`}
          trendPositive={true}
          icon={<FileText className="text-indigo-500" />} 
        />
        <StatsCard 
          title="Paid & Cleared" 
          value={`₹${paidVal.toFixed(1)} Cr`} 
          icon={<CheckCircle2 className="text-emerald-500" />} 
          trend={`${paidBills.length} settled bills`} 
          trendPositive={true} 
        />
        <StatsCard 
          title="Pending Approval" 
          value={`₹${pendingVal.toFixed(1)} Cr`} 
          trend={`${pendingBills.length} awaiting approval`}
          trendPositive={pendingBills.length === 0}
          icon={<IndianRupee className="text-amber-500" />} 
        />
        <StatsCard 
          title="Overdue Payments" 
          value={`₹${overdueVal.toFixed(1)} Cr`} 
          icon={<AlertCircle className="text-rose-500" />} 
          trend={`${overdueBills.length} urgent bills`} 
          trendPositive={false} 
        />
      </div>

      {/* EVM Section */}
      <div>
        <EarnedValueCurve
          data={evmData}
          bac={112000000}
          height={320}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-800">Budget vs Actual by Work Package (₹ Cr)</h3>
            <Link to="/finance/budgets" className="text-xs font-semibold text-indigo-600 hover:underline">
              Manage Budgets →
            </Link>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis fontSize={11} />
                <RechartsTooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Budget" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Actual" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-bold text-slate-800 mb-3">Project Cash Flow Forecast (₹ Cr)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" fontSize={11} />
                <YAxis fontSize={11} />
                <RechartsTooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="Inflow" stroke="#10b981" fillOpacity={1} fill="url(#colorIn)" />
                <Area type="monotone" dataKey="Outflow" stroke="#f43f5e" fillOpacity={1} fill="url(#colorOut)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Bills Register Table */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Recent Vendor Invoices & Billing Register</h3>
          <span className="text-xs text-slate-500 font-medium">{bills.length} total records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] text-slate-500 uppercase bg-slate-50 border-b border-slate-100 font-semibold">
              <tr>
                <th className="px-4 py-3">Bill #</th>
                <th className="px-4 py-3">Vendor</th>
                <th className="px-4 py-3">PO #</th>
                <th className="px-4 py-3">Base Amount</th>
                <th className="px-4 py-3">TDS</th>
                <th className="px-4 py-3">GST</th>
                <th className="px-4 py-3">Net Payable</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Approval Stage</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayBills.map((bill: any) => (
                <tr key={bill.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-indigo-600">{bill.id || bill.billNumber}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{bill.vendor || bill.vendorName || 'Vendor'}</td>
                  <td className="px-4 py-3 text-slate-600">{bill.po || bill.poNumber || '—'}</td>
                  <td className="px-4 py-3">{bill.amount || bill.grossAmount || '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{bill.tds || bill.tdsAmount || '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{bill.gst || bill.gstAmount || '—'}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{bill.net || bill.netAmount || bill.amount || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      bill.status === 'Paid' ? 'text-emerald-700 bg-emerald-50' :
                      bill.status === 'Overdue' || bill.status === 'DISPUTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {bill.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{bill.stage || bill.approvalStage || 'Under Review'}</td>
                  <td className="px-4 py-3 text-slate-500">{bill.date || bill.submittedDate || 'Recent'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
