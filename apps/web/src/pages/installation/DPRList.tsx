import React, { useState, useMemo } from 'react';
import { PermissionGate } from '../../components/auth/PermissionGate';
import { ReadOnlyBanner } from '../../components/auth/ReadOnlyBanner';
import { usePermission } from '../../hooks/usePermission';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { ConfirmDeleteDialog } from '../../components/ui/ConfirmDeleteDialog';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Plus, Search, Filter, MapPin, CloudRain, Thermometer, Droplets, AlertTriangle, CheckCircle, Clock, X, Info, Pencil, Trash2 } from 'lucide-react';

interface DPRLog {
  id: string;
  date: string;
  segment: string;
  gangId: string;
  terrain: 'Plain' | 'Hilly' | 'Forest';
  activity: string;
  outputQty: number;
  unit: string;
  manpower: number;
  hours: number;
  gpsTag: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
  efficiency?: number;
}

interface WeatherLog {
  id: string;
  date: string;
  segment: string;
  condition: 'Clear' | 'Rain' | 'Storm' | 'Cloudy';
  temperature: number;
  humidity: number;
  impact: 'None' | 'Partial' | 'Full Stop';
  loggedBy: string;
}

interface IssueLog {
  id: string;
  date: string;
  segment: string;
  gangId: string;
  reason: 'Right of Way' | 'Material Shortage' | 'Weather' | 'Equipment Breakdown' | 'Other';
  idleHours: number;
  description: string;
  status: 'Open' | 'Resolved';
}

const BENCHMARKS = {
  Plain: { min: 1.5, max: 2.0 },
  Hilly: { min: 1.0, max: 1.5 },
  Forest: { min: 0.5, max: 1.0 },
};

const INITIAL_DPR_LOGS: DPRLog[] = [];

const MOCK_WEATHER_LOGS: WeatherLog[] = [
  { id: 'WL-001', date: '2023-10-01', segment: 'Seg-A1', condition: 'Clear', temperature: 32, humidity: 45, impact: 'None', loggedBy: 'Ramesh K.' },
  { id: 'WL-002', date: '2023-10-01', segment: 'Seg-B2', condition: 'Cloudy', temperature: 28, humidity: 60, impact: 'None', loggedBy: 'Suresh M.' },
  { id: 'WL-003', date: '2023-10-03', segment: 'Seg-B2', condition: 'Rain', temperature: 24, humidity: 85, impact: 'Partial', loggedBy: 'Suresh M.' },
  { id: 'WL-004', date: '2023-10-04', segment: 'Seg-C2', condition: 'Storm', temperature: 22, humidity: 90, impact: 'Full Stop', loggedBy: 'Amit T.' },
  { id: 'WL-005', date: '2023-10-05', segment: 'Seg-D1', condition: 'Clear', temperature: 34, humidity: 40, impact: 'None', loggedBy: 'Vikram S.' },
];

const MOCK_ISSUE_LOGS: IssueLog[] = [
  { id: 'IS-001', date: '2023-10-03', segment: 'Seg-B2', gangId: 'G-02', reason: 'Weather', idleHours: 2, description: 'Sudden rain halted stringing work.', status: 'Resolved' },
  { id: 'IS-002', date: '2023-10-04', segment: 'Seg-C2', gangId: 'G-05', reason: 'Weather', idleHours: 8, description: 'Storm caused full work stoppage.', status: 'Resolved' },
  { id: 'IS-003', date: '2023-10-05', segment: 'Seg-D1', gangId: 'G-06', reason: 'Right of Way', idleHours: 3, description: 'Local dispute over land access.', status: 'Open' },
  { id: 'IS-004', date: '2023-10-06', segment: 'Seg-C1', gangId: 'G-03', reason: 'Material Shortage', idleHours: 4, description: 'Cement delivery delayed.', status: 'Resolved' },
  { id: 'IS-005', date: '2023-10-07', segment: 'Seg-A2', gangId: 'G-04', reason: 'Equipment Breakdown', idleHours: 5, description: 'Crane breakdown.', status: 'Open' },
];

const PRODUCTIVITY_DATA = [
  { gang: 'G-01 (Plain)', output: 1.8, benchmark: 1.75 },
  { gang: 'G-02 (Hilly)', output: 1.1, benchmark: 1.25 },
  { gang: 'G-03 (Forest)', output: 0.7, benchmark: 0.75 },
  { gang: 'G-04 (Plain)', output: 1.7, benchmark: 1.75 },
  { gang: 'G-07 (Hilly)', output: 1.4, benchmark: 1.25 },
];

const TABS = [
  { id: 'logs', label: 'Daily Logs' },
  { id: 'analytics', label: 'Productivity Analytics' },
  { id: 'weather', label: 'Weather Log' },
  { id: 'issues', label: 'Issues & Idle Time' },
];

import { usePersistentState } from '../../hooks/usePersistentState';

export default function DPRList() {
  const { canCreate, canUpdate, canRemove } = usePermission('4.1');
  const [activeTab, setActiveTab] = useState('logs');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [terrainFilter, setTerrainFilter] = useState<string>('All');
  const [dprLogs, setDprLogs] = usePersistentState<DPRLog[]>('epc_dpr_logs', INITIAL_DPR_LOGS);
  const [editRow, setEditRow] = useState<DPRLog | null>(null);
  const [deleteRow, setDeleteRow] = useState<DPRLog | null>(null);
  const [gpsCaptured, setGpsCaptured] = useState<string | null>(null);

  const filteredLogs = useMemo(() => {
    return dprLogs.filter(log => {
      const matchesSearch = log.gangId.toLowerCase().includes(searchQuery.toLowerCase()) || log.segment.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTerrain = terrainFilter === 'All' || log.terrain === terrainFilter;
      return matchesSearch && matchesTerrain;
    });
  }, [dprLogs, searchQuery, terrainFilter]);

  const handleDelete = (row: DPRLog) => setDeleteRow(row);
  const confirmDelete = () => {
    if (!deleteRow) return;
    setDprLogs(prev => prev.filter(r => r !== deleteRow));
    setDeleteRow(null);
  };

  const handleSaveEdit = () => {
    if (!editRow) return;
    setDprLogs(prev => prev.map(l => l.id === editRow.id ? editRow : l));
    setEditRow(null);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Approved': return 'success';
      case 'Rejected': return 'danger';
      case 'Submitted': return 'primary';
      case 'Draft': return 'secondary';
      default: return 'default';
    }
  };

  const getEfficiencyColor = (efficiency?: number) => {
    if (!efficiency) return 'text-gray-500';
    if (efficiency >= 95) return 'text-green-600';
    if (efficiency >= 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderDailyLogs = () => (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Gang ID or Segment..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            value={terrainFilter}
            onChange={(e) => setTerrainFilter(e.target.value)}
          >
            <option value="All">All Terrains</option>
            <option value="Plain">Plain</option>
            <option value="Hilly">Hilly</option>
            <option value="Forest">Forest</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DPR ID / Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Segment & Gang</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Terrain</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Output / Eff.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resources</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GPS Tag</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              {(canUpdate || canRemove) && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-blue-600">{log.id}</div>
                  <div className="text-sm text-gray-500">{log.date}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{log.segment}</div>
                  <div className="text-sm text-gray-500">{log.gangId}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {log.terrain}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {log.activity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{log.outputQty} {log.unit}</div>
                  <div className={`text-xs font-medium ${getEfficiencyColor(log.efficiency)}`}>
                    {log.efficiency}% Eff.
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{log.manpower} Men</div>
                  <div className="text-sm text-gray-500">{log.hours} Hrs</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {log.gpsTag}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={getStatusBadge(log.status) as any}>{log.status}</Badge>
                </td>
                {(canUpdate || canRemove) && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      {canUpdate && (
                        <button onClick={() => setEditRow(log)} className="p-1.5 rounded-md hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors" title="Edit">
                          <Pencil size={13} />
                        </button>
                      )}
                      {canRemove && (
                        <button onClick={() => handleDelete(log)} className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex gap-3">
        <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">BRD 5.6 Benchmarks (Gap 5.6)</p>
          <p>Productivity benchmarks: Plain (1.5-2.0 km/day), Hilly (1.0-1.5 km/day), Forest (0.5-1.0 km/day). Minimum acceptable efficiency is 90% of L2 baseline.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-500 mb-1">Avg Efficiency vs L2</div>
          <div className="text-2xl font-bold text-green-600">92.4%</div>
          <div className="text-xs text-gray-500 mt-1">Across all terrains</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500 mb-1">Plain Terrain Avg</div>
          <div className="text-2xl font-bold text-gray-900">1.75 km/day</div>
          <div className="text-xs text-green-600 mt-1">Target: 1.5 - 2.0</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500 mb-1">Hilly Terrain Avg</div>
          <div className="text-2xl font-bold text-gray-900">1.15 km/day</div>
          <div className="text-xs text-yellow-600 mt-1">Target: 1.0 - 1.5</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500 mb-1">Forest Terrain Avg</div>
          <div className="text-2xl font-bold text-gray-900">0.65 km/day</div>
          <div className="text-xs text-yellow-600 mt-1">Target: 0.5 - 1.0</div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Output by Gang vs Benchmark</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={PRODUCTIVITY_DATA} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="gang" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="output" name="Actual Output (km)" fill="#3b82f6" />
              <Bar dataKey="benchmark" name="Target Benchmark (km)" fill="#94a3b8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );

  const renderWeatherLog = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex gap-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
        <div className="text-sm text-yellow-800">
          <p className="font-semibold">Weather Logging Requirement (BRD 5.10)</p>
          <p>100% weather logging is required per DPR to track force majeure events and validate idle time claims.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date / Segment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conditions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temp / Humidity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work Impact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logged By</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {MOCK_WEATHER_LOGS.map((log) => (
              <tr key={log.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{log.date}</div>
                  <div className="text-sm text-gray-500">{log.segment}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {log.condition === 'Clear' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {log.condition === 'Rain' && <CloudRain className="h-4 w-4 text-blue-500" />}
                    {log.condition === 'Storm' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    {log.condition === 'Cloudy' && <CloudRain className="h-4 w-4 text-gray-400" />}
                    <span className="text-sm text-gray-900">{log.condition}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1"><Thermometer className="h-3 w-3" /> {log.temperature}°C</span>
                    <span className="flex items-center gap-1"><Droplets className="h-3 w-3" /> {log.humidity}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={log.impact === 'None' ? 'success' : log.impact === 'Partial' ? 'warning' : 'danger' as any}>
                    {log.impact}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {log.loggedBy}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderIssues = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-red-50 border-red-100">
          <div className="text-sm text-red-800 mb-1">Total Idle Hours (This Week)</div>
          <div className="text-2xl font-bold text-red-600">22 hrs</div>
        </Card>
        <Card className="p-4 bg-blue-50 border-blue-100">
          <div className="text-sm text-blue-800 mb-1">Weather Related Delay</div>
          <div className="text-2xl font-bold text-blue-600">10 hrs</div>
        </Card>
        <Card className="p-4 bg-orange-50 border-orange-100">
          <div className="text-sm text-orange-800 mb-1">RoW / Material Delay</div>
          <div className="text-2xl font-bold text-orange-600">12 hrs</div>
        </Card>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date / Segment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gang</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Idle Hours</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {MOCK_ISSUE_LOGS.map((issue) => (
              <tr key={issue.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{issue.date}</div>
                  <div className="text-xs text-gray-500">{issue.segment}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {issue.gangId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {issue.reason}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-red-600 font-medium gap-1">
                    <Clock className="h-4 w-4" />
                    {issue.idleHours} hrs
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {issue.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={issue.status === 'Open' ? 'danger' : 'success' as any}>
                    {issue.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily Progress Reports (DPR)"
        description="Monitor field productivity, weather impacts, and gang efficiency (BRD 5.5, 5.6, 5.10)"
        actions={
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
        <ReadOnlyBanner moduleId="4.1" />
            Log DPR
          </Button>
        }
      />

      <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === 'logs' && renderDailyLogs()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'weather' && renderWeatherLog()}
        {activeTab === 'issues' && renderIssues()}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Mobile DPR Entry (Mock)</h2>
            <p className="text-sm text-gray-500 mb-4">Simulating mobile entry (BRD Gap 5.5)</p>
            
            <form 
              className="space-y-4" 
              onSubmit={(e) => { 
                e.preventDefault(); 
                const newDpr: DPRLog = {
                  id: `DPR-${1016 + dprLogs.length}`,
                  date: new Date().toISOString().split('T')[0],
                  segment: 'Seg-A1',
                  gangId: 'G-01',
                  terrain: 'Plain',
                  activity: 'Stringing',
                  outputQty: 1.5,
                  unit: 'km',
                  manpower: 14,
                  hours: 8,
                  gpsTag: gpsCaptured || '21.142, 79.082',
                  status: 'Submitted',
                  efficiency: 94,
                };
                setDprLogs(prev => [newDpr, ...prev]);
                setIsModalOpen(false); 
                setGpsCaptured(null);
              }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input type="date" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" defaultValue="2023-10-09" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gang ID</label>
                  <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    <option>G-01</option>
                    <option>G-02</option>
                    <option>G-03</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Terrain</label>
                  <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    <option>Plain</option>
                    <option>Hilly</option>
                    <option>Forest</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Activity</label>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option>Dismantling</option>
                  <option>Stringing</option>
                  <option>Earthing</option>
                  <option>Substation Erection</option>
                  <option>Civil Works</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Output Qty</label>
                  <input type="number" step="0.1" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" placeholder="e.g. 1.5" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Weather</label>
                  <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    <option>Clear</option>
                    <option>Rain</option>
                    <option>Storm</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Idle Hours (if any)</label>
                <input type="number" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" defaultValue="0" />
              </div>
              <div className="pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setGpsCaptured('21.142, 79.082 (±3m)')}
                  className={`w-full flex justify-center gap-2 mb-4 ${gpsCaptured ? 'border-green-500 text-green-700 bg-green-50' : ''}`}
                >
                  <MapPin className="h-4 w-4" />
                  {gpsCaptured ? `Captured: ${gpsCaptured}` : 'Capture GPS Location'}
                </Button>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Submit DPR
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit DPR Modal */}
      {editRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Edit DPR Log</h3>
              <button onClick={() => setEditRow(null)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">DPR ID</label>
                <input value={editRow.id} readOnly className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-slate-50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Gang ID</label>
                  <input 
                    value={editRow.gangId} 
                    onChange={e => setEditRow({ ...editRow, gangId: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Segment</label>
                  <input 
                    value={editRow.segment} 
                    onChange={e => setEditRow({ ...editRow, segment: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Activity</label>
                  <input 
                    value={editRow.activity} 
                    onChange={e => setEditRow({ ...editRow, activity: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Output Qty</label>
                  <input 
                    type="number" 
                    value={editRow.outputQty} 
                    onChange={e => setEditRow({ ...editRow, outputQty: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
                <select 
                  value={editRow.status} 
                  onChange={e => setEditRow({ ...editRow, status: e.target.value as DPRLog['status'] })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="Draft">Draft</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-200">
              <button onClick={() => setEditRow(null)} className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={handleSaveEdit} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDeleteDialog
        open={!!deleteRow}
        recordName={deleteRow?.id ?? 'this record'}
        recordType="DPR Log"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteRow(null)}
      />
    </div>
  );
}
