import React, { useState, useMemo, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useAuth, User } from '../../contexts/AuthContext';
import {
  ROLES, MODULES, PERMISSION_MATRIX,
  RoleId, ModuleId, PermissionLevel, ModuleConfig,
  permissionLabel,
} from '../../config/rbac';
import {
  Shield, Users, Search, Edit2, Save, X, Plus, RotateCcw,
  AlertTriangle, CheckCircle2, Lock, Eye, Pencil, Unlock,
  Star, Settings, Trash2, RefreshCw, Power, AlertCircle,
  ArrowLeft, ArrowRight, Check, ShieldCheck, Activity
} from 'lucide-react';
import { resetAllEpcData } from '../../utils/persistentStorage';
import { ApiLogbookTab } from '../../components/admin/ApiLogbookTab';

// ── Permission Options & Helpers ───────────────────────────
const PERM_OPTIONS: { value: PermissionLevel; label: string; desc: string; color: string; icon: React.ReactNode }[] = [
  { value: 'F', label: 'Full',    desc: 'View + Create + Edit + Delete + Approve',  color: 'bg-green-500',  icon: <Star size={12} /> },
  { value: 'E', label: 'Edit',    desc: 'View + Create + Edit (cannot Delete/Approve)', color: 'bg-blue-500', icon: <Pencil size={12} /> },
  { value: 'R', label: 'Read',    desc: 'View only — cannot make changes',           color: 'bg-slate-400',  icon: <Eye size={12} /> },
  { value: 'A', label: 'Approve', desc: 'View + Approve workflow steps only',        color: 'bg-amber-500',  icon: <CheckCircle2 size={12} /> },
  { value: 'V', label: 'View',    desc: 'Limited portal view (client-facing)',       color: 'bg-purple-500', icon: <Eye size={12} /> },
  { value: null, label: 'None',   desc: 'No access — module hidden from navigation',  color: 'bg-red-500',    icon: <Lock size={12} /> },
];

function PermBadge({ perm }: { perm: PermissionLevel }) {
  const opt = PERM_OPTIONS.find(o => o.value === perm) ?? PERM_OPTIONS[5];
  return (
    <span className={`inline-flex items-center gap-1 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs ${opt.color}`}>
      {opt.icon} {opt.label}
    </span>
  );
}

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function avatarColor(role: RoleId): string {
  const colors = [
    'bg-indigo-600', 'bg-emerald-600', 'bg-violet-600',
    'bg-amber-600', 'bg-rose-600', 'bg-cyan-600', 'bg-orange-600', 'bg-blue-600'
  ];
  const idx = role.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length;
  return colors[idx];
}

// ── Lifecycle Stage Tag for Modules ─────────────────────────
function getModuleStage(modId: string): string {
  switch (modId) {
    case '4.1': return 'Stage 0 & 5 (Projects & Site)';
    case '4.2': return 'Stage 7 (Collections)';
    case '4.3': return 'Stage 3 (Gangs)';
    case '4.4': return 'Stage 0 & 5 (Surveys & ROW)';
    case '4.5': return 'Stage 2 (Guarantees & Insurance)';
    case '4.6': return 'Stage 7 (EOT & Delays)';
    case '4.7': return 'Stage 6 (Finance & Bills)';
    case '4.8': return 'Cross-Stage (PO Amendments)';
    case '4.9': return 'Stage 7 (Risks)';
    case '4.10': return 'Stage 1 (Award & Contracts)';
    case '4.11': return 'Cross-Stage (HR & Attendance)';
    case '4.12': return 'Stage 5 (Safety & HSE)';
    case '4.13': return 'Stage 5 (QA/QC & Inspections)';
    case '4.14': return 'Stage 2 & 3 (Procurement & POs)';
    case '4.15': return 'Stage 5 (Inventory & Warehouses)';
    case '4.16': return 'Cross-Stage (Client Portal)';
    case '4.17': return 'Stage 4 (Correspondence)';
    case '4.18': return 'Stage 4 (Engineering Docs)';
    case '4.19': return 'Admin (Settings & Engine)';
    case '4.20': return 'Stage 6 (Commissioning & Handover)';
    case '4.21': return 'Stage 4 (RFI)';
    case '4.22': return 'Stage 3 (Minutes of Meeting)';
    case '4.23': return 'Stage 4 (Transmittals)';
    case '4.24': return 'Stage 4 (Deliverable Schedule)';
    case '4.25': return 'Stage 4 (Comment Response)';
    case '4.26': return 'Stage 2 (Statutory Approvals)';
    case '4.27': return 'Stage 3 (Issue Tracker)';
    default: return 'General';
  }
}

// ── Role Category Helper ────────────────────────────────────
function getRoleCategory(roleId: RoleId): string {
  if (['project_director', 'project_manager'].includes(roleId)) return 'Management';
  if (['survey_team', 'gang_supervisor', 'store_manager', 'plant_manager'].includes(roleId)) return 'Operations & Manufacturing';
  if (['lead_design_engineer', 'quality_inspector', 'document_controller'].includes(roleId)) return 'Engineering & Quality';
  if (['finance_controller', 'treasury_manager', 'bid_manager', 'vendor_manager'].includes(roleId)) return 'Commercial & Finance';
  if (['hr_manager', 'safety_hse_officer', 'compliance_officer', 'sales_executive', 'claims_manager', 'contract_manager', 'legal_contracts'].includes(roleId)) return 'Contracts & Governance';
  return 'System & Stakeholders';
}

// ── Module Permission Row ──────────────────────────────────
interface ModulePermRowProps {
  mod: typeof MODULES[number];
  defaultPerm: PermissionLevel;
  override: PermissionLevel | undefined;
  effective: PermissionLevel;
  onChange: (modId: ModuleId, val: PermissionLevel) => void;
  onReset: (modId: ModuleId) => void;
}

function ModulePermRow({ mod, defaultPerm, override, effective, onChange, onReset }: ModulePermRowProps) {
  const isOverridden = override !== undefined;
  const stage = getModuleStage(mod.id);

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-xl border transition-all ${
      isOverridden ? 'bg-amber-50/80 border-amber-300 shadow-xs' : 'bg-white border-slate-200 hover:border-slate-300'
    }`}>
      {/* Module info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">
            {mod.id}
          </span>
          <span className="text-sm font-semibold text-slate-800">{mod.name}</span>
          <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {stage}
          </span>
          {isOverridden && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded">
              <AlertTriangle size={10} /> Overridden
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5 truncate">{mod.routes.join(', ')}</p>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        {/* Role Default badge */}
        <div className="flex flex-col items-center gap-0.5 w-16">
          <span className="text-[9px] text-slate-400 font-medium">Role Default</span>
          <PermBadge perm={defaultPerm} />
        </div>

        {/* Dropdown selector */}
        <div className="w-48">
          <select
            value={override !== undefined ? (override ?? '__null__') : '__inherit__'}
            onChange={e => {
              const v = e.target.value;
              if (v === '__inherit__') { onReset(mod.id); }
              else onChange(mod.id, v === '__null__' ? null : v as PermissionLevel);
            }}
            className={`w-full text-xs px-2.5 py-1.5 rounded-lg border font-medium focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-colors ${
              isOverridden ? 'border-amber-400 bg-amber-50/90 text-amber-900' : 'border-slate-300 bg-white text-slate-700'
            }`}
          >
            <option value="__inherit__">↩ Inherit Role Default ({permissionLabel(defaultPerm)})</option>
            <optgroup label="── Set Explicit Override ──">
              {PERM_OPTIONS.map(opt => (
                <option key={String(opt.value)} value={opt.value ?? '__null__'}>
                  {opt.label} — {opt.desc.split(' (')[0]}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Effective Result badge */}
        <div className="flex flex-col items-center gap-0.5 w-16">
          <span className="text-[9px] text-slate-400 font-medium">Effective</span>
          <PermBadge perm={effective} />
        </div>

        {/* Quick Toggle: No Access vs Active */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => effective === null ? onReset(mod.id) : onChange(mod.id, null)}
            title={effective === null ? 'Grant role access' : 'Completely revoke access'}
            className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${effective !== null ? 'bg-emerald-500' : 'bg-rose-400'}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${effective !== null ? 'left-5' : 'left-0.5'}`} />
          </button>
          {isOverridden && (
            <button
              onClick={() => onReset(mod.id)}
              title="Reset this module back to role default"
              className="p-1 text-amber-600 hover:text-amber-800 rounded hover:bg-amber-100 transition-colors"
            >
              <RotateCcw size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Role Module Permission Row Component (Role × Module Permissions) ──────
interface RoleModulePermRowProps {
  mod: ModuleConfig;
  factoryPerm: PermissionLevel;
  effective: PermissionLevel;
  isCustomized: boolean;
  onChange: (modId: ModuleId, val: PermissionLevel) => void;
  onReset: (modId: ModuleId) => void;
}

function RoleModulePermRow({
  mod,
  factoryPerm,
  effective,
  isCustomized,
  onChange,
  onReset
}: RoleModulePermRowProps) {
  const stage = getModuleStage(mod.id);

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-xl border transition-all ${
      isCustomized ? 'bg-amber-50/80 border-amber-300 shadow-xs' : 'bg-white border-slate-200 hover:border-slate-300'
    }`}>
      {/* Module info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">
            {mod.id}
          </span>
          <span className="text-sm font-semibold text-slate-800">{mod.name}</span>
          <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {stage}
          </span>
          {isCustomized && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded">
              <AlertTriangle size={10} /> Customized vs Factory
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5 truncate">{mod.routes.join(', ')}</p>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        {/* Factory Baseline badge */}
        <div className="flex flex-col items-center gap-0.5 w-16">
          <span className="text-[9px] text-slate-400 font-medium">Factory Base</span>
          <PermBadge perm={factoryPerm} />
        </div>

        {/* Dropdown selector */}
        <div className="w-48">
          <select
            value={effective ?? '__null__'}
            onChange={e => {
              const v = e.target.value;
              onChange(mod.id, v === '__null__' ? null : v as PermissionLevel);
            }}
            className={`w-full text-xs px-2.5 py-1.5 rounded-lg border font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-colors ${
              isCustomized ? 'border-amber-400 bg-amber-50/90 text-amber-900 font-bold' : 'border-slate-300 bg-white text-slate-700'
            }`}
          >
            {PERM_OPTIONS.map(opt => (
              <option key={String(opt.value)} value={opt.value ?? '__null__'}>
                {opt.label} — {opt.desc.split(' (')[0]}
              </option>
            ))}
          </select>
        </div>

        {/* Effective Result badge */}
        <div className="flex flex-col items-center gap-0.5 w-16">
          <span className="text-[9px] text-slate-400 font-medium">Role Level</span>
          <PermBadge perm={effective} />
        </div>

        {/* Quick Toggle: No Access vs Full / Factory */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onChange(mod.id, effective === null ? (factoryPerm ?? 'F') : null)}
            title={effective === null ? 'Grant access' : 'Revoke access (Set None)'}
            className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${effective !== null ? 'bg-emerald-500' : 'bg-rose-400'}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${effective !== null ? 'left-5' : 'left-0.5'}`} />
          </button>
          {isCustomized && (
            <button
              onClick={() => onReset(mod.id)}
              title="Reset this module back to factory default"
              className="p-1 text-amber-600 hover:text-amber-800 rounded hover:bg-amber-100 transition-colors"
            >
              <RotateCcw size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Add User Modal ─────────────────────────────────────────
function AddUserModal({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (u: User) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<RoleId>('project_manager');
  const [dept, setDept] = useState('');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <Plus size={18} className="text-indigo-600" /> Add New User
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        <form onSubmit={e => {
          e.preventDefault();
          if (name && email) {
            onSave({
              id: `U${Date.now().toString().slice(-4)}`,
              name,
              email,
              role,
              department: dept || undefined,
              overrides: {}
            });
            setName('');
            setEmail('');
            setRole('project_manager');
            setDept('');
            onClose();
          }
        }}>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Full Name *</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="e.g. Ramesh Kumar"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Email *</label>
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                type="email"
                placeholder="e.g. ramesh@aparind.com"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Assigned Role *</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as RoleId)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 font-medium text-slate-800"
              >
                {ROLES.map(r => (
                  <option key={r.id} value={r.id}>{r.label} — {r.description}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Department</label>
              <input
                value={dept}
                onChange={e => setDept(e.target.value)}
                placeholder="e.g. Projects / Site Execution"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700">Add User</Button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Edit User Profile Modal ─────────────────────────────────
function EditUserModal({
  user,
  open,
  onClose,
  onSave
}: {
  user: User | null;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<User>) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dept, setDept] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setDept(user.department || '');
    }
  }, [user]);

  if (!open || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <Edit2 size={18} className="text-indigo-600" /> Edit User Profile
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        <form onSubmit={e => {
          e.preventDefault();
          onSave(user.id, { name, email, department: dept || undefined });
          onClose();
        }}>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Full Name</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Email</label>
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                type="email"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Department</label>
              <input
                value={dept}
                onChange={e => setDept(e.target.value)}
                placeholder="e.g. Operations"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700">Save Changes</Button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Confirm Role Change Modal ────────────────────────────────
function ConfirmRoleChangeModal({
  pendingChange,
  isTargetRoleActive,
  onClose,
  onConfirm,
  resetOverrides,
  setResetOverrides,
}: {
  pendingChange: { user: User; newRole: RoleId } | null;
  isTargetRoleActive: boolean;
  onClose: () => void;
  onConfirm: (resetOverrides: boolean) => void;
  resetOverrides: boolean;
  setResetOverrides: (val: boolean) => void;
}) {
  if (!pendingChange) return null;

  const { user, newRole } = pendingChange;
  const currentRoleObj = ROLES.find(r => r.id === user.role);
  const newRoleObj = ROLES.find(r => r.id === newRole);
  const userOverrideCount = Object.keys(user.overrides || {}).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5 border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg leading-snug">Confirm Role Reassignment</h3>
              <p className="text-xs text-slate-500">Security & permission level changes will apply immediately</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Affected User Card */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3.5">
          <div className={`w-11 h-11 rounded-xl ${avatarColor(user.role)} flex items-center justify-center text-white text-sm font-black shrink-0 shadow-xs`}>
            {initials(user.name)}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-slate-900 text-sm truncate">{user.name}</h4>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Department: {user.department || 'Not specified'}</p>
          </div>
        </div>

        {/* Role Comparison Visual (Current ➔ New) */}
        <div className="bg-gradient-to-r from-indigo-50/50 via-white to-indigo-50/50 p-4 rounded-xl border border-indigo-100">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2.5 text-center">
            Role Transition
          </p>
          <div className="flex items-center justify-between gap-3">
            {/* Current Role */}
            <div className="flex-1 p-3 rounded-lg bg-white border border-slate-200 shadow-xs text-center">
              <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wide">Current Role</span>
              <span className="text-xs font-bold text-slate-700 block mt-1">{currentRoleObj?.label || user.role}</span>
            </div>

            {/* Transition Arrow */}
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ArrowRight size={16} />
            </div>

            {/* New Role */}
            <div className="flex-1 p-3 rounded-lg bg-indigo-50 border border-indigo-300 shadow-xs text-center">
              <span className="text-[10px] font-semibold text-indigo-500 block uppercase tracking-wide">New Assigned Role</span>
              <span className="text-xs font-bold text-indigo-900 block mt-1">{newRoleObj?.label || newRole}</span>
            </div>
          </div>
        </div>

        {/* Inactive Role Warning (if new role is currently deactivated) */}
        {!isTargetRoleActive && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5">
            <AlertTriangle size={18} className="text-rose-600 mt-0.5 shrink-0" />
            <div className="text-xs text-rose-800">
              <strong className="font-bold">Warning: Role Deactivated</strong>
              <p className="mt-0.5">
                The role <strong>{newRoleObj?.label}</strong> is currently deactivated in the <em>Role Status & Activation</em> tab. Assigning this role will immediately suspend this user's ability to log in until the role is re-enabled.
              </p>
            </div>
          </div>
        )}

        {/* Baseline change info & Reset Overrides Checkbox */}
        <div className="space-y-2">
          <div className="text-xs text-slate-600 leading-relaxed bg-slate-50/80 p-3 rounded-xl border border-slate-200">
            <p>
              Reassigning role will change the baseline permissions for this user across all 27 EPC modules according to the <strong>{newRoleObj?.label}</strong> matrix profile.
            </p>
            {userOverrideCount > 0 && (
              <label className="flex items-start gap-2.5 mt-3 pt-2.5 border-t border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={resetOverrides}
                  onChange={e => setResetOverrides(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-400"
                />
                <span className="text-xs text-slate-700">
                  <strong>Reset existing {userOverrideCount} custom module override{userOverrideCount !== 1 ? 's' : ''}</strong> to new role defaults.
                  <span className="block text-[11px] text-slate-400">Uncheck to preserve previously customized module access overrides.</span>
                </span>
              </label>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <Button
            type="button"
            onClick={() => onConfirm(resetOverrides)}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm"
          >
            <Check size={16} /> Confirm Role Change
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main AdminPanel Component ──────────────────────────────
export default function AdminPanel() {
  const {
    user,
    users,
    disabledRoles,
    updateUserRole,
    updateUserOverrides,
    updateUser,
    addUser,
    deleteUser,
    resetUserToRoleDefaults,
    resetAllToFactoryDefaults,
    toggleRoleActive,
    isRoleActive,
    roleMatrix,
    updateRolePermissions,
    resetRoleToFactoryMatrix,
    resetAllRoleMatrixToFactory,
    login
  } = useAuth();

  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || '');
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [activeTab, setActiveTab] = useState<'users' | 'overrides' | 'role-permissions' | 'roles' | 'matrix' | 'api-logs'>('users');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [toast, setToast] = useState('');

  // Pending role change state for confirmation modal in Tab 1
  const [pendingRoleChange, setPendingRoleChange] = useState<{ user: User; newRole: RoleId } | null>(null);
  const [resetOverridesOnRoleChange, setResetOverridesOnRoleChange] = useState(true);

  // Per-user permission staging draft for Tab 2
  const [stagedOverrides, setStagedOverrides] = useState<Record<string, Partial<Record<ModuleId, PermissionLevel>>>>({});
  const [hasUnsavedOverrides, setHasUnsavedOverrides] = useState(false);

  // Role × Module Permissions state for Tab 3
  const [selectedRoleId, setSelectedRoleId] = useState<RoleId>('project_manager');
  const [stagedRoleMatrix, setStagedRoleMatrix] = useState<Record<string, Partial<Record<ModuleId, PermissionLevel>>>>({});
  const [hasUnsavedRoleMatrix, setHasUnsavedRoleMatrix] = useState(false);
  const [roleModuleSearch, setRoleModuleSearch] = useState('');
  const [roleModuleStageFilter, setRoleModuleStageFilter] = useState('all');

  // Filters
  const [moduleSearch, setModuleSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [roleSearch, setRoleSearch] = useState('');
  const [roleCategoryFilter, setRoleCategoryFilter] = useState('all');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }

  // Ensure selectedUserId always points to a valid user
  useEffect(() => {
    if (!users.some(u => u.id === selectedUserId) && users.length > 0) {
      setSelectedUserId(users[0].id);
    }
  }, [users, selectedUserId]);

  const selectedUser = users.find(u => u.id === selectedUserId) || users[0];

  // Effective permission lookup (User x Module Permissions)
  const getDraftPermission = (userId: string, modId: ModuleId): PermissionLevel => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return null;
    const currentDraft = stagedOverrides[userId]?.[modId];
    if (currentDraft !== undefined) return currentDraft;
    if (targetUser.overrides?.[modId] !== undefined) return targetUser.overrides[modId]!;
    return roleMatrix[targetUser.role]?.[modId] ?? PERMISSION_MATRIX[targetUser.role]?.[modId] ?? null;
  };

  const getEffectiveDraftOverride = (userId: string, modId: ModuleId): PermissionLevel | undefined => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return undefined;
    if (stagedOverrides[userId]?.[modId] !== undefined) {
      return stagedOverrides[userId]![modId];
    }
    return targetUser.overrides?.[modId];
  };

  const handleStageOverrideChange = (userId: string, modId: ModuleId, val: PermissionLevel) => {
    setStagedOverrides(prev => {
      const userDraft = { ...(prev[userId] ?? users.find(u => u.id === userId)?.overrides ?? {}) };
      userDraft[modId] = val;
      return { ...prev, [userId]: userDraft };
    });
    setHasUnsavedOverrides(true);
  };

  const handleResetSingleOverride = (userId: string, modId: ModuleId) => {
    setStagedOverrides(prev => {
      const userDraft = { ...(prev[userId] ?? users.find(u => u.id === userId)?.overrides ?? {}) };
      delete userDraft[modId];
      return { ...prev, [userId]: userDraft };
    });
    setHasUnsavedOverrides(true);
  };

  const handleSaveOverrides = (userId: string) => {
    const draft = stagedOverrides[userId] ?? users.find(u => u.id === userId)?.overrides ?? {};
    updateUserOverrides(userId, draft);
    setHasUnsavedOverrides(false);
    showToast(`✅ Saved custom module permissions for ${users.find(u => u.id === userId)?.name}`);
  };

  const handleGrantAll = (userId: string) => {
    const allFull: Partial<Record<ModuleId, PermissionLevel>> = {};
    MODULES.forEach(m => { allFull[m.id] = 'F'; });
    setStagedOverrides(prev => ({ ...prev, [userId]: allFull }));
    setHasUnsavedOverrides(true);
  };

  const handleRevokeAll = (userId: string) => {
    const allNull: Partial<Record<ModuleId, PermissionLevel>> = {};
    MODULES.forEach(m => { allNull[m.id] = null; });
    setStagedOverrides(prev => ({ ...prev, [userId]: allNull }));
    setHasUnsavedOverrides(true);
  };

  const handleResetToRoleDefaults = (userId: string) => {
    resetUserToRoleDefaults(userId);
    setStagedOverrides(prev => {
      const copy = { ...prev };
      delete copy[userId];
      return copy;
    });
    setHasUnsavedOverrides(false);
    showToast(`↩ Reset ${users.find(u => u.id === userId)?.name} to standard role permissions`);
  };

  // Role Reassignment with Mandatory Confirmation Modal (Tab 1: Users & Role Assignment)
  const handleInitiateRoleChange = (targetUser: User, newRole: RoleId) => {
    if (targetUser.role === newRole) return;
    setPendingRoleChange({ user: targetUser, newRole });
    setResetOverridesOnRoleChange(true);
  };

  const handleConfirmRoleChange = (resetOverrides: boolean) => {
    if (!pendingRoleChange) return;
    const { user: targetUser, newRole } = pendingRoleChange;
    updateUserRole(targetUser.id, newRole);
    if (resetOverrides) {
      resetUserToRoleDefaults(targetUser.id);
      setStagedOverrides(prev => {
        const copy = { ...prev };
        delete copy[targetUser.id];
        return copy;
      });
    }
    const newRoleObj = ROLES.find(r => r.id === newRole);
    showToast(`✅ Role updated: ${targetUser.name} is now ${newRoleObj?.label}`);
    setPendingRoleChange(null);
  };

  // ── Role × Module Permissions Helpers & Handlers ─────────
  const selectedRole = ROLES.find(r => r.id === selectedRoleId) || ROLES[0];

  const assignedUsersToSelectedRole = useMemo(() => {
    return users.filter(u => u.role === selectedRoleId);
  }, [users, selectedRoleId]);

  const getDraftRolePermission = (roleId: RoleId, modId: ModuleId): PermissionLevel => {
    const draft = stagedRoleMatrix[roleId];
    if (draft && draft[modId] !== undefined) return draft[modId]!;
    return roleMatrix[roleId]?.[modId] ?? PERMISSION_MATRIX[roleId]?.[modId] ?? null;
  };

  const isRoleModCustomizedFromFactory = (roleId: RoleId, modId: ModuleId): boolean => {
    const current = getDraftRolePermission(roleId, modId);
    const factory = PERMISSION_MATRIX[roleId]?.[modId] ?? null;
    return current !== factory;
  };

  const countCustomizedRoleModules = (roleId: RoleId): number => {
    return MODULES.filter(m => isRoleModCustomizedFromFactory(roleId, m.id)).length;
  };

  const filteredRoleModules = useMemo(() => {
    return MODULES.filter(m => {
      const q = roleModuleSearch.toLowerCase();
      const matchSearch = m.name.toLowerCase().includes(q) || m.id.includes(q);
      const stage = getModuleStage(m.id);
      const matchStage = roleModuleStageFilter === 'all' || stage.toLowerCase().includes(roleModuleStageFilter.toLowerCase());
      return matchSearch && matchStage;
    });
  }, [roleModuleSearch, roleModuleStageFilter]);

  const handleStageRolePermissionChange = (roleId: RoleId, modId: ModuleId, val: PermissionLevel) => {
    setStagedRoleMatrix(prev => {
      const currentDraft = prev[roleId] ?? {};
      return {
        ...prev,
        [roleId]: { ...currentDraft, [modId]: val }
      };
    });
    setHasUnsavedRoleMatrix(true);
  };

  const handleResetSingleRolePermission = (roleId: RoleId, modId: ModuleId) => {
    const factoryVal = PERMISSION_MATRIX[roleId]?.[modId] ?? null;
    handleStageRolePermissionChange(roleId, modId, factoryVal);
  };

  const handleRoleGrantAll = (roleId: RoleId) => {
    const allFull: Partial<Record<ModuleId, PermissionLevel>> = {};
    MODULES.forEach(m => { allFull[m.id] = 'F'; });
    setStagedRoleMatrix(prev => ({ ...prev, [roleId]: allFull }));
    setHasUnsavedRoleMatrix(true);
  };

  const handleRoleRevokeAll = (roleId: RoleId) => {
    const allNull: Partial<Record<ModuleId, PermissionLevel>> = {};
    MODULES.forEach(m => { allNull[m.id] = null; });
    setStagedRoleMatrix(prev => ({ ...prev, [roleId]: allNull }));
    setHasUnsavedRoleMatrix(true);
  };

  const handleResetRoleToFactory = (roleId: RoleId) => {
    resetRoleToFactoryMatrix(roleId);
    setStagedRoleMatrix(prev => {
      const copy = { ...prev };
      delete copy[roleId];
      return copy;
    });
    setHasUnsavedRoleMatrix(false);
    showToast(`↩ Reset role "${ROLES.find(r => r.id === roleId)?.label}" to factory default permissions`);
  };

  const handleSaveRoleMatrix = (roleId: RoleId) => {
    const draft = stagedRoleMatrix[roleId];
    if (draft) {
      updateRolePermissions(roleId, draft);
      setStagedRoleMatrix(prev => {
        const copy = { ...prev };
        delete copy[roleId];
        return copy;
      });
    }
    setHasUnsavedRoleMatrix(false);
    showToast(`✅ Saved default module permissions for role: ${ROLES.find(r => r.id === roleId)?.label}`);
  };

  // Filtered users for Tab 1
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const q = search.toLowerCase();
      const matchSearch =
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.department || '').toLowerCase().includes(q) ||
        (ROLES.find(r => r.id === u.role)?.label || '').toLowerCase().includes(q);
      const matchRole = filterRole === 'all' || u.role === filterRole;
      return matchSearch && matchRole;
    });
  }, [users, search, filterRole]);

  // Filtered modules for Tab 2
  const filteredModules = useMemo(() => {
    return MODULES.filter(m => {
      const q = moduleSearch.toLowerCase();
      const matchSearch = m.name.toLowerCase().includes(q) || m.id.includes(q);
      const stage = getModuleStage(m.id);
      const matchStage = stageFilter === 'all' || stage.toLowerCase().includes(stageFilter.toLowerCase());
      return matchSearch && matchStage;
    });
  }, [moduleSearch, stageFilter]);

  // Filtered roles for Tab 3 (Role Status & Activation)
  const filteredRoles = useMemo(() => {
    return ROLES.filter(r => {
      const q = roleSearch.toLowerCase();
      const matchSearch = r.label.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
      const category = getRoleCategory(r.id);
      const matchCat = roleCategoryFilter === 'all' || category.toLowerCase().includes(roleCategoryFilter.toLowerCase());
      return matchSearch && matchCat;
    });
  }, [roleSearch, roleCategoryFilter]);

  // Active override count helper
  const countActiveOverrides = (u: User) => {
    const staged = stagedOverrides[u.id];
    if (staged !== undefined) return Object.keys(staged).length;
    return Object.keys(u.overrides || {}).length;
  };

  // ── Non-Admin Warning Banner with One-Click Elevate ───────
  if (user?.role !== 'system_admin') {
    const adminUser = users.find(u => u.role === 'system_admin') || users[0];
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-5">
          <Lock size={32} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">System Administrator Only</h2>
        <p className="text-sm text-slate-500 max-w-md mb-6">
          The RBAC & User Management Panel requires the <strong>System Administrator</strong> role to modify user roles and module permissions.
        </p>
        <div className="flex flex-col items-center gap-3">
          <Button
            onClick={() => {
              if (adminUser) login(adminUser);
              showToast(`Logged in as ${adminUser.name} (System Administrator)`);
            }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
          >
            <Shield size={16} /> Switch to System Administrator ({adminUser.name})
          </Button>
          <p className="text-xs text-slate-400">Current Role: {ROLES.find(r => r.id === user?.role)?.label || user?.role}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="RBAC & User Access Administration"
        description="Manage users independently from roles, activate/deactivate role access, and tweak per-user module permissions"
        action={
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-xs sm:text-sm"
            >
              <Plus size={15} /> Add New User
            </Button>
            <button
              onClick={() => {
                if (window.confirm('Reset all users, role activations, module permissions, and module data back to original system factory defaults?')) {
                  resetAllToFactoryDefaults();
                  resetAllEpcData();
                  setStagedOverrides({});
                  setHasUnsavedOverrides(false);
                  showToast('↩ Entire system & module data reset to factory defaults');
                }
              }}
              title="Reset entire system & module data to default seed data"
              className="p-2 border border-slate-300 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        }
      />

      {/* Tab Navigation (Role Status positioned between User Module Permissions and Standard Roles Matrix) */}
      <div className="flex gap-1 bg-slate-100 p-1.5 rounded-2xl w-fit border border-slate-200 flex-wrap">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'users' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users size={15} /> Users & Role Assignment
        </button>
        <button
          onClick={() => setActiveTab('overrides')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'overrides' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Settings size={15} /> User × Module Permissions
        </button>
        <button
          onClick={() => setActiveTab('role-permissions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'role-permissions' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck size={15} /> Role × Module Permissions
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'roles' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Power size={15} /> Role Status & Activation ({ROLES.length})
          {disabledRoles.length > 0 && (
            <span className="text-[10px] font-bold bg-rose-500 text-white px-1.5 py-0.2 rounded-full">
              {disabledRoles.length} off
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('matrix')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'matrix' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Shield size={15} /> Standard Roles Matrix
        </button>
        <button
          onClick={() => setActiveTab('api-logs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'api-logs' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Activity size={15} className="text-emerald-600" /> 📋 API Request Log
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════
          TAB 1: USERS & ROLE ASSIGNMENT (Only place to change roles)
         ══════════════════════════════════════════════════════════ */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="p-4 border-slate-200">
              <p className="text-2xl font-extrabold text-indigo-600">{users.length}</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Total Users</p>
            </Card>
            <Card className="p-4 border-slate-200">
              <p className="text-2xl font-extrabold text-emerald-600">
                {new Set(users.map(u => u.role)).size} / {ROLES.length}
              </p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Active Assigned Roles</p>
            </Card>
            <Card className="p-4 border-slate-200">
              <p className="text-2xl font-extrabold text-amber-600">
                {users.filter(u => countActiveOverrides(u) > 0).length}
              </p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Users with Overrides</p>
            </Card>
            <Card className="p-4 border-slate-200">
              <p className="text-2xl font-extrabold text-rose-600">
                {users.filter(u => disabledRoles.includes(u.role)).length}
              </p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Suspended Users (Role Inactive)</p>
            </Card>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex gap-3 flex-wrap items-center">
            <div className="relative flex-1 min-w-64">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search user by name, email, department, or role..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <select
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
              className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 font-medium"
            >
              <option value="all">Filter: All Roles ({ROLES.length})</option>
              {ROLES.map(r => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* User List Table */}
          <Card className="overflow-hidden border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                  <tr>
                    <th className="px-4 py-3.5">User Identity</th>
                    <th className="px-4 py-3.5">Assigned Role (Direct Selector)</th>
                    <th className="px-4 py-3.5">Department</th>
                    <th className="px-4 py-3.5">Module Access & Status</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map(u => {
                    const currentRole = ROLES.find(r => r.id === u.role);
                    const overrideCount = countActiveOverrides(u);
                    const isCurrentUser = user?.id === u.id;
                    const isRoleDisabled = disabledRoles.includes(u.role);

                    return (
                      <tr
                        key={u.id}
                        className={`transition-colors ${
                          isRoleDisabled
                            ? 'bg-slate-100/70 border-l-4 border-rose-400 text-slate-400 opacity-60'
                            : 'hover:bg-slate-50/70'
                        }`}
                      >
                        {/* User Identity */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full ${avatarColor(u.role)} flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs ${isRoleDisabled ? 'grayscale' : ''}`}>
                              {initials(u.name)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`font-semibold ${isRoleDisabled ? 'text-slate-500' : 'text-slate-800'}`}>{u.name}</span>
                                {isCurrentUser && (
                                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 rounded">
                                    You
                                  </span>
                                )}
                                {isRoleDisabled && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                                    <Lock size={10} /> Role Deactivated
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Direct Role Selector (Only here) */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <select
                              value={u.role}
                              onChange={e => handleInitiateRoleChange(u, e.target.value as RoleId)}
                              className={`text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 shadow-xs cursor-pointer transition-colors ${
                                isRoleDisabled
                                  ? 'bg-rose-50/80 border border-rose-300 text-rose-900 font-bold'
                                  : 'bg-white border border-slate-300 text-slate-800 hover:border-indigo-400'
                              }`}
                            >
                              {ROLES.map(r => (
                                <option key={r.id} value={r.id}>
                                  {r.label} {!isRoleActive(r.id) ? '(Inactive)' : ''}
                                </option>
                              ))}
                            </select>
                            <span className="text-[11px] text-slate-400 hidden xl:inline line-clamp-1 max-w-[200px]" title={currentRole?.description}>
                              {currentRole?.description}
                            </span>
                          </div>
                        </td>

                        {/* Department */}
                        <td className="px-4 py-3.5 text-xs text-slate-600 font-medium">
                          {u.department || '—'}
                        </td>

                        {/* Module Access Status */}
                        <td className="px-4 py-3.5">
                          {isRoleDisabled ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
                              <Lock size={12} className="text-rose-600" />
                              Login Suspended
                            </span>
                          ) : overrideCount > 0 ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-300 px-2.5 py-1 rounded-full">
                              <AlertTriangle size={12} className="text-amber-600" />
                              {overrideCount} custom override{overrideCount > 1 ? 's' : ''}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                              <CheckCircle2 size={12} className="text-emerald-500" />
                              Standard Role Baseline
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Tweak Permissions */}
                            <button
                              onClick={() => {
                                setSelectedUserId(u.id);
                                setActiveTab('overrides');
                              }}
                              className="px-2.5 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50/60 text-indigo-700 hover:bg-indigo-100 font-medium text-xs flex items-center gap-1 transition-colors"
                              title="Tweak granular module permissions"
                            >
                              <Settings size={13} />
                              <span>Tweak Access</span>
                            </button>

                            {/* Reset Overrides */}
                            {overrideCount > 0 && (
                              <button
                                onClick={() => handleResetToRoleDefaults(u.id)}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                                title="Reset all overrides to role default"
                              >
                                <RotateCcw size={13} />
                              </button>
                            )}

                            {/* Edit Profile */}
                            <button
                              onClick={() => setEditingUser(u)}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                              title="Edit user profile"
                            >
                              <Edit2 size={13} />
                            </button>

                            {/* Delete User */}
                            {!isCurrentUser && (
                              <button
                                onClick={() => {
                                  if (window.confirm(`Delete user ${u.name}?`)) {
                                    deleteUser(u.id);
                                    showToast(`User ${u.name} deleted`);
                                  }
                                }}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Delete user"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB 2: USER × MODULE PERMISSIONS (Only module tweaks, NO role change)
         ══════════════════════════════════════════════════════════ */}
      {activeTab === 'overrides' && (
        <div className="space-y-4">
          {/* Top Bar: Return to Tab 1 + Switch User Picker (Zero Role Labels) */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('users')}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-indigo-600 bg-white hover:bg-slate-50 border border-slate-300 px-3.5 py-2 rounded-xl shadow-xs transition-colors"
            >
              <ArrowLeft size={14} /> Back to Users & Role Assignment
            </button>

            {/* Quick Switch User (Name + Email only, NO roles) */}
            <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-xs">
              <Users size={14} className="text-indigo-600" />
              <label htmlFor="user-perm-select" className="text-xs font-medium text-slate-500 whitespace-nowrap">
                Select User to Configure:
              </label>
              <select
                id="user-perm-select"
                value={selectedUserId}
                onChange={e => setSelectedUserId(e.target.value)}
                className="text-xs font-bold text-slate-800 bg-transparent border-0 focus:outline-none focus:ring-0 cursor-pointer pr-2"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* User Profile & Role Info Banner */}
          <Card className="p-5 border-slate-200 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              {/* User Identity Display */}
              <div className="flex items-center gap-4 flex-1">
                <div className={`w-14 h-14 rounded-2xl ${avatarColor(selectedUser.role)} flex items-center justify-center text-white text-lg font-black shadow-md shrink-0`}>
                  {initials(selectedUser.name)}
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-xl font-bold text-slate-900">{selectedUser.name}</h3>

                    {/* READ-ONLY Assigned Role Badge (NO role dropdown here — role assignment is strictly in Tab 1) */}
                    <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1 text-xs">
                      <Lock size={12} className="text-slate-400" />
                      <span className="text-[11px] text-slate-500 font-medium">Assigned Role:</span>
                      <span className="font-bold text-slate-800">{ROLES.find(r => r.id === selectedUser.role)?.label}</span>
                    </div>

                    {!isRoleActive(selectedUser.role) && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                        <Lock size={12} /> Role Inactive
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500">
                    {selectedUser.email} · {selectedUser.department || 'No department'} ·{' '}
                    <span className="font-semibold text-slate-700">
                      {countActiveOverrides(selectedUser)} active module override{countActiveOverrides(selectedUser) !== 1 ? 's' : ''}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-2 italic">
                      (To reassign user role, use "Users & Role Assignment" tab with confirmation)
                    </span>
                  </p>
                </div>
              </div>

              {/* Batch Action Toolbar */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handleGrantAll(selectedUser.id)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Unlock size={13} /> Grant All (Full)
                </button>
                <button
                  onClick={() => handleRevokeAll(selectedUser.id)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Lock size={13} /> Revoke All (None)
                </button>
                <button
                  onClick={() => handleResetToRoleDefaults(selectedUser.id)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw size={13} /> Reset to Role Defaults
                </button>
                {hasUnsavedOverrides && (
                  <Button
                    onClick={() => handleSaveOverrides(selectedUser.id)}
                    className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-xs py-2"
                  >
                    <Save size={14} /> Save Changes
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Search & Filter Bar */}
          <div className="flex gap-3 flex-wrap items-center">
            <div className="relative flex-1 min-w-48">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={moduleSearch}
                onChange={e => setModuleSearch(e.target.value)}
                placeholder="Search modules (e.g. 4.22, Minutes of Meeting, DPR, Transmittals)..."
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <select
              value={stageFilter}
              onChange={e => setStageFilter(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 font-medium"
            >
              <option value="all">All Lifecycle Stages</option>
              <option value="Stage 0">Stage 0 — Bidding</option>
              <option value="Stage 1">Stage 1 — Award</option>
              <option value="Stage 2">Stage 2 — Golden Period</option>
              <option value="Stage 3">Stage 3 — Pre-Construction</option>
              <option value="Stage 4">Stage 4 — Engineering</option>
              <option value="Stage 5">Stage 5 — Construction</option>
              <option value="Stage 6">Stage 6 — Commissioning</option>
              <option value="Stage 7">Stage 7 — Post-Completion</option>
              <option value="Cross-Stage">Cross-Stage / HR / Contracts</option>
            </select>
          </div>

          {/* Module Overrides List */}
          <div className="space-y-2">
            {filteredModules.map(mod => {
              const defaultPerm = PERMISSION_MATRIX[selectedUser.role]?.[mod.id] ?? null;
              const override = getEffectiveDraftOverride(selectedUser.id, mod.id);
              const effective = getDraftPermission(selectedUser.id, mod.id);

              return (
                <ModulePermRow
                  key={mod.id}
                  mod={mod}
                  defaultPerm={defaultPerm}
                  override={override}
                  effective={effective}
                  onChange={(modId, val) => handleStageOverrideChange(selectedUser.id, modId, val)}
                  onReset={modId => handleResetSingleOverride(selectedUser.id, modId)}
                />
              );
            })}
          </div>

          {/* Bottom Save Bar if Unsaved */}
          {hasUnsavedOverrides && (
            <div className="sticky bottom-4 z-40 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-indigo-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-indigo-900 font-medium">
                <AlertTriangle size={16} className="text-amber-500" />
                <span>You have unsaved module permission changes for <strong>{selectedUser.name}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleSaveOverrides(selectedUser.id)}
                  className="bg-green-600 hover:bg-green-700 flex items-center gap-2 text-sm"
                >
                  <Save size={14} /> Save Permission Overrides
                </Button>
                <button
                  onClick={() => {
                    setStagedOverrides(prev => {
                      const copy = { ...prev };
                      delete copy[selectedUser.id];
                      return copy;
                    });
                    setHasUnsavedOverrides(false);
                    showToast('Discarded unsaved draft changes');
                  }}
                  className="px-3 py-2 text-xs text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                >
                  Discard
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB 3: ROLE × MODULE PERMISSIONS (Role Baseline Customization)
         ══════════════════════════════════════════════════════════ */}
      {activeTab === 'role-permissions' && (
        <div className="space-y-4">
          {/* Top Bar: Navigation + Select Role to Configure */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('users')}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-indigo-600 bg-white hover:bg-slate-50 border border-slate-300 px-3.5 py-2 rounded-xl shadow-xs transition-colors"
            >
              <ArrowLeft size={14} /> Back to Users & Role Assignment
            </button>

            {/* Select Role Picker */}
            <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-xs">
              <ShieldCheck size={14} className="text-indigo-600" />
              <label htmlFor="role-perm-select" className="text-xs font-medium text-slate-500 whitespace-nowrap">
                Select Role to Configure:
              </label>
              <select
                id="role-perm-select"
                value={selectedRoleId}
                onChange={e => setSelectedRoleId(e.target.value as RoleId)}
                className="text-xs font-bold text-slate-800 bg-transparent border-0 focus:outline-none focus:ring-0 cursor-pointer pr-2"
              >
                {ROLES.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.label} ({getRoleCategory(r.id)}) {!isRoleActive(r.id) ? '— [Deactivated]' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Role Profile & Baseline Info Banner */}
          <Card className="p-5 border-slate-200 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              {/* Role Identity Display */}
              <div className="flex items-center gap-4 flex-1">
                <div className={`w-14 h-14 rounded-2xl ${avatarColor(selectedRole.id)} flex items-center justify-center text-white text-lg font-black shadow-md shrink-0`}>
                  {initials(selectedRole.label)}
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-xl font-bold text-slate-900">{selectedRole.label}</h3>

                    {/* Category Badge */}
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                      {getRoleCategory(selectedRole.id)}
                    </span>

                    {/* Active Status Badge */}
                    {isRoleActive(selectedRole.id) ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <CheckCircle2 size={12} className="text-emerald-500" /> Active Role
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                        <Lock size={12} /> Role Deactivated
                      </span>
                    )}

                    {/* Factory vs Customized Indicator */}
                    {countCustomizedRoleModules(selectedRole.id) > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-300 px-2.5 py-0.5 rounded-full">
                        <AlertTriangle size={12} className="text-amber-600" />
                        {countCustomizedRoleModules(selectedRole.id)} module(s) customized vs factory
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        Standard Factory Baseline
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 max-w-2xl">
                    {selectedRole.description}
                  </p>

                  <div className="flex items-center gap-2 pt-1 text-xs text-slate-600 flex-wrap">
                    <span className="font-semibold text-slate-700">
                      Assigned Users ({assignedUsersToSelectedRole.length}):
                    </span>
                    {assignedUsersToSelectedRole.length > 0 ? (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {assignedUsersToSelectedRole.slice(0, 5).map(u => (
                          <button
                            key={u.id}
                            onClick={() => {
                              setSelectedUserId(u.id);
                              setActiveTab('overrides');
                            }}
                            className="inline-flex items-center gap-1 bg-white border border-slate-200 hover:border-indigo-300 px-2 py-0.5 rounded-md text-[11px] font-medium text-slate-700 hover:text-indigo-600 transition-colors"
                            title={`Tweak individual permissions for ${u.name}`}
                          >
                            <span>{u.name}</span>
                            {countActiveOverrides(u) > 0 && (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Has custom overrides" />
                            )}
                          </button>
                        ))}
                        {assignedUsersToSelectedRole.length > 5 && (
                          <span className="text-[11px] text-slate-400 font-medium">
                            +{assignedUsersToSelectedRole.length - 5} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">No users assigned to this role</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Batch Action Toolbar */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handleRoleGrantAll(selectedRole.id)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-xs transition-colors"
                  title="Grant Full ('F') access on all 27 modules to this role"
                >
                  <Unlock size={13} /> Grant All (Full)
                </button>
                <button
                  onClick={() => handleRoleRevokeAll(selectedRole.id)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 shadow-xs transition-colors"
                  title="Revoke access on all 27 modules for this role"
                >
                  <Lock size={13} /> Revoke All (None)
                </button>
                <button
                  onClick={() => handleResetRoleToFactory(selectedRole.id)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition-colors"
                  title="Reset this role's permissions back to BRD factory defaults"
                >
                  <RotateCcw size={13} /> Reset to Factory Baseline
                </button>
                {hasUnsavedRoleMatrix && (
                  <Button
                    onClick={() => handleSaveRoleMatrix(selectedRole.id)}
                    className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-xs py-2 shadow-xs"
                  >
                    <Save size={14} /> Save Role Baseline
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Search & Stage Filter Bar */}
          <div className="flex gap-3 flex-wrap items-center">
            <div className="relative flex-1 min-w-48">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={roleModuleSearch}
                onChange={e => setRoleModuleSearch(e.target.value)}
                placeholder="Search modules for this role (e.g. 4.22, Minutes of Meeting, DPR, Transmittals)..."
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <select
              value={roleModuleStageFilter}
              onChange={e => setRoleModuleStageFilter(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 font-medium"
            >
              <option value="all">All Lifecycle Stages</option>
              <option value="Stage 0">Stage 0 — Bidding</option>
              <option value="Stage 1">Stage 1 — Award</option>
              <option value="Stage 2">Stage 2 — Golden Period</option>
              <option value="Stage 3">Stage 3 — Pre-Construction</option>
              <option value="Stage 4">Stage 4 — Engineering</option>
              <option value="Stage 5">Stage 5 — Construction</option>
              <option value="Stage 6">Stage 6 — Commissioning</option>
              <option value="Stage 7">Stage 7 — Post-Completion</option>
              <option value="Cross-Stage">Cross-Stage / HR / Contracts</option>
            </select>
          </div>

          {/* Role Module Permission Rows */}
          <div className="space-y-2">
            {filteredRoleModules.map(mod => {
              const factoryPerm = PERMISSION_MATRIX[selectedRole.id]?.[mod.id] ?? null;
              const effective = getDraftRolePermission(selectedRole.id, mod.id);
              const isCustomized = isRoleModCustomizedFromFactory(selectedRole.id, mod.id);

              return (
                <RoleModulePermRow
                  key={mod.id}
                  mod={mod}
                  factoryPerm={factoryPerm}
                  effective={effective}
                  isCustomized={isCustomized}
                  onChange={(modId, val) => handleStageRolePermissionChange(selectedRole.id, modId, val)}
                  onReset={modId => handleResetSingleRolePermission(selectedRole.id, modId)}
                />
              );
            })}
          </div>

          {/* Sticky Bottom Save Bar for Role Permissions */}
          {hasUnsavedRoleMatrix && (
            <div className="sticky bottom-4 z-40 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-indigo-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-indigo-900 font-medium">
                <AlertTriangle size={16} className="text-amber-500" />
                <span>
                  You have unsaved baseline permission changes for role <strong>{selectedRole.label}</strong> ({assignedUsersToSelectedRole.length} assigned user{assignedUsersToSelectedRole.length !== 1 ? 's' : ''} will inherit this)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleSaveRoleMatrix(selectedRole.id)}
                  className="bg-green-600 hover:bg-green-700 flex items-center gap-2 text-sm"
                >
                  <Save size={14} /> Save Role Baseline
                </Button>
                <button
                  onClick={() => {
                    setStagedRoleMatrix(prev => {
                      const copy = { ...prev };
                      delete copy[selectedRole.id];
                      return copy;
                    });
                    setHasUnsavedRoleMatrix(false);
                    showToast('Discarded unsaved role draft changes');
                  }}
                  className="px-3 py-2 text-xs text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                >
                  Discard
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB 4: ROLE STATUS & ACTIVATION (The New Requested Feature)
         ══════════════════════════════════════════════════════════ */}
      {activeTab === 'roles' && (
        <div className="space-y-5">
          {/* Explanation Alert */}
          <div className="bg-indigo-50/80 border border-indigo-200 rounded-2xl p-4.5 flex items-start gap-3">
            <Power size={20} className="text-indigo-600 mt-0.5 shrink-0" />
            <div className="text-xs text-indigo-900 space-y-1">
              <p className="font-bold text-sm">Role Status & Organization-Wide Activation Switch</p>
              <p className="leading-relaxed text-indigo-800">
                Use the slider switch next to any role to activate or deactivate it. When a role is deactivated, all users assigned to that role are immediately <strong>greyed out</strong> across the suite and <strong>cannot log in</strong> until an Administrator switches the role back on.
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="p-4 border-slate-200">
              <p className="text-2xl font-extrabold text-slate-800">{ROLES.length}</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Total System Roles</p>
            </Card>
            <Card className="p-4 border-slate-200">
              <p className="text-2xl font-extrabold text-emerald-600">{ROLES.length - disabledRoles.length}</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Active Roles</p>
            </Card>
            <Card className="p-4 border-slate-200">
              <p className="text-2xl font-extrabold text-rose-600">{disabledRoles.length}</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Deactivated Roles</p>
            </Card>
            <Card className="p-4 border-slate-200">
              <p className="text-2xl font-extrabold text-amber-600">
                {users.filter(u => disabledRoles.includes(u.role)).length}
              </p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Suspended Users Affected</p>
            </Card>
          </div>

          {/* Search & Category Filter */}
          <div className="flex gap-3 flex-wrap items-center">
            <div className="relative flex-1 min-w-64">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={roleSearch}
                onChange={e => setRoleSearch(e.target.value)}
                placeholder="Search roles by title or description..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <select
              value={roleCategoryFilter}
              onChange={e => setRoleCategoryFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 font-medium"
            >
              <option value="all">All Role Categories</option>
              <option value="Management">Management</option>
              <option value="Operations">Operations & Manufacturing</option>
              <option value="Engineering">Engineering & Quality</option>
              <option value="Commercial">Commercial & Finance</option>
              <option value="Contracts">Contracts & Governance</option>
              <option value="System">System & Stakeholders</option>
            </select>
          </div>

          {/* Role Cards with Interactive Activation Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRoles.map(role => {
              const active = isRoleActive(role.id);
              const assignedUsers = users.filter(u => u.role === role.id);
              const isSystemAdmin = role.id === 'system_admin';
              const category = getRoleCategory(role.id);

              return (
                <Card
                  key={role.id}
                  className={`p-5 border transition-all flex flex-col justify-between ${
                    active
                      ? 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                      : 'bg-rose-50/50 border-rose-300 shadow-xs'
                  }`}
                >
                  <div>
                    {/* Top row: Role Category badge & Activation Slider */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {category}
                      </span>

                      {/* Interactive Activation Slider Switch */}
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-bold ${active ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {active ? 'Active' : 'Deactivated'}
                        </span>
                        {isSystemAdmin ? (
                          <div title="System Administrator cannot be deactivated" className="p-1 text-slate-400 bg-slate-100 rounded-lg">
                            <Lock size={16} />
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              const newStatus = !active;
                              toggleRoleActive(role.id, newStatus);
                              showToast(
                                newStatus
                                  ? `✅ Role "${role.label}" reactivated. Assigned users can now log in.`
                                  : `⚠️ Role "${role.label}" deactivated. All users with this role are now suspended from login.`
                              );
                            }}
                            className={`w-12 h-6.5 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                              active ? 'bg-emerald-500' : 'bg-rose-400'
                            }`}
                            title={active ? 'Click to deactivate role' : 'Click to reactivate role'}
                          >
                            <div
                              className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                                active ? 'translate-x-5.5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Role Title & ID */}
                    <h3 className={`font-bold text-base leading-tight ${active ? 'text-slate-900' : 'text-rose-950'}`}>
                      {role.label}
                    </h3>
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5">ID: {role.id}</p>

                    {/* Role Description */}
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      {role.description}
                    </p>
                  </div>

                  {/* Assigned Users Section */}
                  <div className="mt-4 pt-3.5 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Assigned Users ({assignedUsers.length})
                      </span>
                      {!active && assignedUsers.length > 0 && (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded flex items-center gap-1">
                          <AlertCircle size={10} /> Suspended
                        </span>
                      )}
                    </div>

                    {assignedUsers.length > 0 ? (
                      <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                        {assignedUsers.map(u => (
                          <div key={u.id} className="flex items-center justify-between text-xs py-0.5">
                            <span className={`font-medium truncate ${!active ? 'text-rose-800 line-through' : 'text-slate-700'}`}>
                              {u.name}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate max-w-[100px]">{u.department || 'Staff'}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No users currently assigned</p>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB 5: STANDARD ROLES MATRIX (Live Baseline Matrix)
         ══════════════════════════════════════════════════════════ */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <Card className="p-4 border-slate-200 flex-1">
              <p className="text-xs font-bold text-slate-600 mb-2">Permission Legend</p>
              <div className="flex flex-wrap gap-4 text-xs">
                {PERM_OPTIONS.map(opt => (
                  <div key={String(opt.value)} className="flex items-center gap-1.5">
                    <PermBadge perm={opt.value} />
                    <span className="text-slate-600 font-medium">{opt.desc}</span>
                  </div>
                ))}
              </div>
            </Card>

            <button
              onClick={() => {
                if (window.confirm('Reset all roles back to immutable factory default matrix? Any custom baseline changes made in "Role × Module Permissions" will be reset.')) {
                  resetAllRoleMatrixToFactory();
                  setStagedRoleMatrix({});
                  setHasUnsavedRoleMatrix(false);
                  showToast('↩ All role matrix permissions reset to factory defaults');
                }
              }}
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
              title="Reset all roles to factory standard matrix"
            >
              <RotateCcw size={14} /> Reset All Roles to Factory Matrix
            </button>
          </div>

          <Card className="overflow-hidden border-slate-200">
            <div className="overflow-x-auto">
              <table className="text-xs w-full text-left">
                <thead>
                  <tr className="bg-slate-800 text-white">
                    <th className="px-4 py-3 sticky left-0 bg-slate-800 z-10 min-w-56 font-bold">
                      Role ({ROLES.length})
                    </th>
                    {MODULES.map(m => (
                      <th key={m.id} className="px-2 py-2 font-semibold text-center min-w-16 border-l border-slate-700">
                        <span className="block text-[10px] text-indigo-300 font-mono">{m.id}</span>
                        <span className="block text-[9px] line-clamp-1" title={m.name}>
                          {m.name.split(' ')[0]}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ROLES.map((role, idx) => {
                    const assignedUsers = users.filter(u => u.role === role.id);
                    const active = isRoleActive(role.id);
                    const isRoleCustomized = MODULES.some(m => (roleMatrix[role.id]?.[m.id] ?? null) !== (PERMISSION_MATRIX[role.id]?.[m.id] ?? null));

                    return (
                      <tr key={role.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'} ${!active ? 'opacity-50 bg-rose-50/40' : ''}`}>
                        <td className={`px-4 py-2.5 font-medium text-slate-800 sticky left-0 z-10 border-r border-slate-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} ${!active ? 'bg-rose-50/70' : ''}`}>
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="font-bold text-slate-900">{role.label}</p>
                                {!active && (
                                  <span className="text-[9px] font-bold text-rose-700 bg-rose-100 px-1 py-0.2 rounded">Off</span>
                                )}
                                {isRoleCustomized && (
                                  <span className="text-[9px] font-bold text-amber-700 bg-amber-100 border border-amber-300 px-1.5 py-0.2 rounded">
                                    Customized
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400 line-clamp-1">{role.description}</p>
                              <button
                                onClick={() => {
                                  setSelectedRoleId(role.id);
                                  setActiveTab('role-permissions');
                                }}
                                className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold underline mt-0.5 inline-block"
                              >
                                Tweak Role Permissions →
                              </button>
                            </div>
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full shrink-0">
                              {assignedUsers.length} user{assignedUsers.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </td>
                        {MODULES.map(mod => {
                          const perm = roleMatrix[role.id]?.[mod.id] ?? PERMISSION_MATRIX[role.id]?.[mod.id] ?? null;
                          const isCellCustomized = perm !== (PERMISSION_MATRIX[role.id]?.[mod.id] ?? null);
                          const opt = PERM_OPTIONS.find(o => o.value === perm);
                          return (
                            <td key={mod.id} className={`px-2 py-2 text-center border-l border-slate-100 ${isCellCustomized ? 'bg-amber-50/50' : ''}`}>
                              <span
                                className={`inline-flex items-center justify-center w-6 h-6 rounded text-white text-[9px] font-bold ${opt?.color ?? 'bg-red-400'} ${isCellCustomized ? 'ring-2 ring-amber-400 ring-offset-1' : ''}`}
                                title={isCellCustomized ? `Customized (Factory Default was: ${PERMISSION_MATRIX[role.id]?.[mod.id] ?? 'None'})` : undefined}
                              >
                                {perm ?? '—'}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB 6: API REQUEST LOG (LOGBOOK)
         ══════════════════════════════════════════════════════════ */}
      {activeTab === 'api-logs' && <ApiLogbookTab />}

      {/* Add User Modal */}
      <AddUserModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={newUser => {
          addUser(newUser);
          showToast(`✅ Created user ${newUser.name} with role ${ROLES.find(r => r.id === newUser.role)?.label}`);
        }}
      />

      {/* Edit User Profile Modal */}
      <EditUserModal
        user={editingUser}
        open={!!editingUser}
        onClose={() => setEditingUser(null)}
        onSave={(id, updates) => {
          updateUser(id, updates);
          showToast(`✅ Updated profile for ${updates.name || 'user'}`);
        }}
      />

      {/* Confirm Role Change Modal */}
      <ConfirmRoleChangeModal
        pendingChange={pendingRoleChange}
        isTargetRoleActive={pendingRoleChange ? isRoleActive(pendingRoleChange.newRole) : true}
        onClose={() => setPendingRoleChange(null)}
        onConfirm={handleConfirmRoleChange}
        resetOverrides={resetOverridesOnRoleChange}
        setResetOverrides={setResetOverridesOnRoleChange}
      />
    </div>
  );
}
