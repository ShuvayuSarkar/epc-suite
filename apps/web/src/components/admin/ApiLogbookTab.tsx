import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  Activity, RefreshCw, Trash2, Search, Filter,
  CheckCircle2, AlertCircle, Database, Server, Clock,
  ArrowDownCircle, ArrowUpCircle, Shield
} from 'lucide-react';

interface RequestLogItem {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  user_id: string | null;
  user_email: string | null;
  user_role: string | null;
  status_code: number | null;
  duration_ms: number | null;
  ip: string | null;
}

interface RequestStats {
  total: number;
  today: number;
  byMethod: { method: string; count: string }[];
}

export function ApiLogbookTab() {
  const [logs, setLogs] = useState<RequestLogItem[]>([]);
  const [stats, setStats] = useState<RequestStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchPath, setSearchPath] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('ALL');
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [backendStatus, setBackendStatus] = useState<'connected' | 'offline' | 'checking'>('checking');

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({ limit: '150' });
      if (searchPath) queryParams.append('path', searchPath);
      if (selectedMethod !== 'ALL') queryParams.append('method', selectedMethod);

      const [logsRes, statsRes] = await Promise.all([
        fetch(`http://localhost:3000/api/admin/request-log?${queryParams.toString()}`),
        fetch('http://localhost:3000/api/admin/request-log/stats'),
      ]);

      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData);
        setBackendStatus('connected');
      } else {
        setBackendStatus('offline');
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      setLastRefreshed(new Date());
    } catch (err) {
      setBackendStatus('offline');
    } finally {
      setIsLoading(false);
    }
  }, [searchPath, selectedMethod]);

  // Initial fetch and auto-refresh interval
  useEffect(() => {
    fetchLogs();
    if (!autoRefresh) return;
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, [fetchLogs, autoRefresh]);

  const handleClear = async () => {
    if (!window.confirm('Are you sure you want to clear all API request logs?')) return;
    try {
      await fetch('http://localhost:3000/api/admin/request-log/clear', { method: 'DELETE' });
      setLogs([]);
      if (stats) setStats({ ...stats, total: 0, today: 0 });
    } catch {}
  };

  const getMethodBadge = (m: string) => {
    switch (m.toUpperCase()) {
      case 'GET':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-700 border border-blue-200">GET</span>;
      case 'POST':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">POST</span>;
      case 'PATCH':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-700 border border-amber-200">PATCH</span>;
      case 'DELETE':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-200">DELETE</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">{m}</span>;
    }
  };

  const getStatusBadge = (code: number | null) => {
    if (!code) return <span className="text-slate-400">—</span>;
    if (code >= 200 && code < 300) {
      return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-green-50 text-green-700 border border-green-200">{code} OK</span>;
    }
    if (code >= 400 && code < 500) {
      return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">{code} Client Error</span>;
    }
    return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">{code} Server Error</span>;
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Top Banner & Status */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-2xl font-black text-slate-900">{stats?.total ?? logs.length}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Total API Requests</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Activity size={20} />
          </div>
        </Card>

        <Card className="p-4 border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-2xl font-black text-emerald-600">{stats?.today ?? logs.length}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Hits Today</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <ArrowDownCircle size={20} />
          </div>
        </Card>

        <Card className="p-4 border-slate-200 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${backendStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <p className="text-base font-bold text-slate-900 capitalize">
                {backendStatus === 'connected' ? 'API Online' : 'API Standby'}
              </p>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">NestJS :3000</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600">
            <Server size={20} />
          </div>
        </Card>

        <Card className="p-4 border-slate-200 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <Database size={15} className="text-emerald-600" />
              <p className="text-sm font-bold text-slate-900">PostgreSQL / Supabase</p>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Stateful Storage Engine</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600">
            <Database size={20} />
          </div>
        </Card>
      </div>

      {/* Control Bar: Filter, Search, Auto-Refresh */}
      <Card className="p-4 border-slate-200">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Method Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'GET', 'POST', 'PATCH', 'DELETE'].map(m => (
              <button
                key={m}
                onClick={() => setSelectedMethod(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedMethod === m
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchPath}
              onChange={e => setSearchPath(e.target.value)}
              placeholder="Filter by endpoint path..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={e => setAutoRefresh(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              Auto-refresh (3s)
            </label>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchLogs}
              disabled={isLoading}
              className="flex items-center gap-1 text-xs"
            >
              <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} /> Refresh
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="flex items-center gap-1 text-xs text-rose-600 hover:bg-rose-50 border-rose-200"
            >
              <Trash2 size={13} /> Clear
            </Button>
          </div>
        </div>
      </Card>

      {/* Request Log Table */}
      <Card className="border-slate-200 overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-indigo-600" />
            <h4 className="font-bold text-slate-800 text-sm">Real-Time Request Logbook</h4>
            <span className="text-xs text-slate-400">({logs.length} logged events)</span>
          </div>
          <span className="text-[11px] text-slate-400">
            Last updated: {lastRefreshed.toLocaleTimeString()}
          </span>
        </div>

        <div className="overflow-x-auto max-h-[550px] overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Activity size={32} className="mx-auto mb-2 text-slate-300" />
              <p className="font-semibold text-sm">No API hits recorded yet</p>
              <p className="text-xs mt-1">Make changes in any module to see live API calls appear here.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0 z-10 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3">Endpoint Path</th>
                  <th className="py-2.5 px-3">User / Identity</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Latency</th>
                  <th className="py-2.5 px-3">Client IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {logs.map((log) => {
                  const time = new Date(log.timestamp).toLocaleTimeString();
                  return (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">{time}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap">{getMethodBadge(log.method)}</td>
                      <td className="py-2.5 px-3 font-semibold text-indigo-700 truncate max-w-xs" title={log.path}>
                        {log.path}
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        {log.user_id ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            <Shield size={10} className="text-indigo-600" /> {log.user_id} ({log.user_role || 'User'})
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Anonymous</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">{getStatusBadge(log.status_code)}</td>
                      <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                        {log.duration_ms != null ? `${log.duration_ms}ms` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                        {log.ip || '127.0.0.1'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
