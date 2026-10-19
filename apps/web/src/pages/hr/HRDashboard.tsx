import React, { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ReadOnlyBanner } from '../../components/auth/ReadOnlyBanner';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatsCard } from '../../components/ui/StatsCard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Users, UserMinus, UserCheck, Briefcase, Plus, ArrowRight, Calendar, Layers } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { usePersistentState } from '../../hooks/usePersistentState';
import { usePermission } from '../../hooks/usePermission';

const initialAttendance = [
  { day: 'Mon', Present: 410, Absent: 12 },
  { day: 'Tue', Present: 405, Absent: 17 },
  { day: 'Wed', Present: 415, Absent: 7 },
  { day: 'Thu', Present: 408, Absent: 14 },
  { day: 'Fri', Present: 412, Absent: 10 },
  { day: 'Sat', Present: 390, Absent: 32 },
  { day: 'Sun', Present: 150, Absent: 272 },
];

const COLORS = ['#6366f1', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#64748b'];

export default function HRDashboard() {
  const navigate = useNavigate();
  const { canCreate } = usePermission('4.11');
  const [employees] = usePersistentState<any[]>('epc_employees', []);
  const [attendance] = usePersistentState<any[]>('epc_attendance', []);

  const totalEmployeesCount = employees.length > 0 ? employees.length : 422;
  const activeCount = employees.length > 0
    ? employees.filter(e => e.status === 'ACTIVE' || e.status === 'Active').length
    : 412;
  const onLeaveCount = totalEmployeesCount - activeCount;

  const deptData = useMemo(() => {
    if (employees.length > 0) {
      const counts: Record<string, number> = {};
      employees.forEach(e => {
        const d = e.department || 'Operations';
        counts[d] = (counts[d] || 0) + 1;
      });
      return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }
    return [
      { name: 'Engineering', value: 45 },
      { name: 'Procurement', value: 25 },
      { name: 'Site Execution', value: 280 },
      { name: 'QA/QC', value: 35 },
      { name: 'Safety (HSE)', value: 20 },
      { name: 'Admin/Finance', value: 17 },
    ];
  }, [employees]);

  return (
    <div className="space-y-6">
      {/* Header with Title and Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <PageHeader 
            title="Human Resources & Workforce" 
            subtitle="Employee records, daily attendance tracking, skill matrices, and PRW subcontractor manpower"
          />
          <ReadOnlyBanner moduleId="4.11" />
        </div>
        <div className="flex items-center gap-3">
          {canCreate && (
            <>
              <Button 
                onClick={() => navigate('/hr/employees')} 
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Plus size={16} /> Add Employee
              </Button>
              <Button 
                onClick={() => navigate('/hr/attendance')} 
                variant="outline"
                className="flex items-center gap-2"
              >
                <Calendar size={16} /> Mark Attendance
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Sub-Navigation Quick Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {[
          { label: 'HR Overview', href: '/hr', icon: <Layers size={14} /> },
          { label: 'Employee Directory', href: '/hr/employees', icon: <Users size={14} /> },
          { label: 'Daily Attendance Register', href: '/hr/attendance', icon: <Calendar size={14} /> },
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
        <StatsCard title="Total Employees" value={String(totalEmployeesCount)} icon={<Users className="text-indigo-500" />} />
        <StatsCard title="Active Today" value={String(activeCount)} icon={<UserCheck className="text-emerald-500" />} trend="Optimal attendance" trendPositive={true} />
        <StatsCard title="On Leave" value={String(onLeaveCount)} icon={<UserMinus className="text-amber-500" />} />
        <StatsCard title="Contract Workers (PRW)" value="1,450" icon={<Briefcase className="text-slate-500" />} trend="+120 mobilized this week" trendPositive={true} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">7-Day Attendance Trend (On-Roll)</h3>
            <Link to="/hr/attendance" className="text-xs font-medium text-indigo-600 hover:underline">
              View Register →
            </Link>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={initialAttendance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" fontSize={12} />
                <YAxis fontSize={12} />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="Present" stackId="a" fill="#10b981" />
                <Bar dataKey="Absent" stackId="a" fill="#f43f5e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Department Breakdown */}
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Workforce by Department</h3>
            <Link to="/hr/employees" className="text-xs font-medium text-indigo-600 hover:underline">
              {employees.length} on-roll records →
            </Link>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deptData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deptData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skill Matrix Viz */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Critical Skill Matrix Coverage</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Certified Linemen (HTLS)</span>
                <span className="font-semibold text-emerald-600">85% (Optimal)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Certified Welders</span>
                <span className="font-semibold text-amber-600">60% (Requires Training)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Safety Stewards</span>
                <span className="font-semibold text-emerald-600">100% (Compliant)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Testing & Commissioning Eng.</span>
                <span className="font-semibold text-rose-600">30% (Critical Shortage)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-rose-500 h-2 rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>
          </div>
        </Card>

        {/* Payroll Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="p-4 bg-indigo-50/50 flex flex-col justify-center">
            <p className="text-sm font-medium text-slate-500">Monthly Payroll (On-Roll)</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">₹1.85 Cr</p>
            <p className="text-xs text-slate-500 mt-2">Processed for current month</p>
          </Card>
          <Card className="p-4 bg-indigo-50/50 flex flex-col justify-center">
            <p className="text-sm font-medium text-slate-500">PRW / Subcontractor Billing</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">₹4.20 Cr</p>
            <p className="text-xs text-slate-500 mt-2">Certified for execution</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
