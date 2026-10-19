import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  STAGE_CONFIGS, StageId, canAccessStage, getModuleIdForRoute,
  canView, canEdit, PERMISSION_MATRIX, ModuleId, MODULES, permissionLabel
} from '../../config/rbac';
import { Lock, ArrowRight, Eye, AlertCircle } from 'lucide-react';

// ── StageGuard ─────────────────────────────────────────────
export function StageGuard({ stageId, children }: { stageId: StageId; children: React.ReactNode }) {
  const { user, roleMatrix } = useAuth();
  if (!user) return null;

  const stage = STAGE_CONFIGS.find(s => s.id === stageId);
  if (!stage) return <>{children}</>;

  const hasAccess = canAccessStage(user.role, stage, roleMatrix);

  if (!hasAccess) {
    const roleLabel = user.role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-5">
          <Lock size={32} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Stage Not Accessible</h2>
        <p className="text-sm text-slate-500 max-w-md mb-4">
          Your role (<strong>{roleLabel}</strong>) does not have access to any of the modules
          used in <strong>{stage.label}</strong>.
        </p>
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-xs text-slate-600 max-w-md text-left">
          <p className="font-semibold mb-2">Modules required for this stage:</p>
          <ul className="space-y-1">
            {stage.primaryModules.map(mod => (
              <li key={mod} className="flex items-center gap-2">
                <span className="text-red-500">✗</span>
                <span>Module {mod} — {MODULES.find(m => m.id === mod)?.name}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-slate-400 mt-4">Contact your System Administrator to request access.</p>
      </div>
    );
  }

  return <>{children}</>;
}

// ── Access level type returned by useChecklistAccess ───────
export type ChecklistAccess = 'full' | 'readonly' | 'none';

/**
 * Given a route (e.g. '/finance/bills'), returns the access level for the current user.
 */
export function useChecklistAccess(route: string): ChecklistAccess {
  const { user, getEffectivePermission } = useAuth();
  if (!user) return 'none';

  const moduleId = getModuleIdForRoute(route);
  if (!moduleId) return 'full'; // unknown routes are open

  const perm = getEffectivePermission(moduleId);
  if (!canView(perm)) return 'none';
  if (!canEdit(perm)) return 'readonly';
  return 'full';
}

// ── ChecklistLink ──────────────────────────────────────────
/**
 * Permission-aware Open button for stage dashboard checklist items.
 *   full     → indigo "Open →" button
 *   readonly → amber "View Only" button
 *   none     → gray disabled "No Access" with tooltip
 */
interface ChecklistLinkProps {
  route: string;
  label?: string;
}

export function ChecklistLink({ route, label = 'Open' }: ChecklistLinkProps) {
  const navigate = useNavigate();
  const access = useChecklistAccess(route);
  const moduleId = getModuleIdForRoute(route);
  const moduleName = moduleId ? MODULES.find(m => m.id === moduleId)?.name ?? moduleId : null;

  if (access === 'none') {
    return (
      <div className="relative group">
        <button
          disabled
          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-slate-100 text-slate-400 font-medium cursor-not-allowed border border-slate-200"
        >
          <Lock size={11} /> No Access
        </button>
        {moduleName && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-800 text-white text-[10px] rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
            {moduleName} — Contact admin for access
          </div>
        )}
      </div>
    );
  }

  if (access === 'readonly') {
    return (
      <div className="relative group">
        <button
          onClick={() => navigate(route)}
          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium border border-amber-200 transition-colors"
        >
          <Eye size={11} /> View Only
        </button>
        {moduleName && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-800 text-white text-[10px] rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
            Read-only access to {moduleName}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => navigate(route)}
      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors"
    >
      {label} <ArrowRight size={11} />
    </button>
  );
}

// ── ChecklistCard ──────────────────────────────────────────
/**
 * A permission-aware wrapper around a checklist item card.
 * When the user has 'none' access to the item's route/module:
 *   - Card gets a grey overlay + lock badge
 *   - All content is still visible but dimmed (transparency)
 * When user has 'readonly' access:
 *   - Amber left border, eye icon badge
 * When user has 'full' access:
 *   - Normal rendering
 */
interface ChecklistCardProps {
  route: string;
  children: React.ReactNode;
  /** Override access check — useful when item has its own moduleId */
  moduleId?: ModuleId;
}

export function ChecklistCardWrapper({ route, children, moduleId }: ChecklistCardProps) {
  const { user, getEffectivePermission } = useAuth();

  const effectiveModuleId = moduleId ?? getModuleIdForRoute(route);
  let access: ChecklistAccess = 'full';

  if (user && effectiveModuleId) {
    const perm = getEffectivePermission(effectiveModuleId);
    if (!canView(perm)) access = 'none';
    else if (!canEdit(perm)) access = 'readonly';
  }

  if (access === 'none') {
    return (
      <div className="relative opacity-40 select-none">
        {children}
        {/* Lock overlay badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-slate-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
          <Lock size={9} /> No Access
        </div>
        {/* Overlay to block interaction */}
        <div className="absolute inset-0 rounded-lg cursor-not-allowed z-5" />
      </div>
    );
  }

  if (access === 'readonly') {
    return (
      <div className="relative border-l-4 border-amber-400">
        {children}
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
          <Eye size={9} /> Read Only
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
