import React from 'react';
import { usePermission } from '../../hooks/usePermission';
import { ModuleId, PermissionLevel, canEdit, canApprove, canView, canDelete } from '../../config/rbac';

interface PermissionGateProps {
  /** The BRD module ID to check (e.g. '4.7' for Finance) */
  moduleId: ModuleId;
  /** What action level is required? Default: 'view' */
  require?: 'view' | 'edit' | 'approve' | 'delete' | 'full';
  /** Content to render when access is denied (default: nothing) */
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Conditionally renders children based on the current user's permission
 * for a specific BRD module.
 *
 * Usage:
 *   <PermissionGate moduleId="4.7" require="edit">
 *     <Button>Create Bill</Button>
 *   </PermissionGate>
 */
export function PermissionGate({ moduleId, require = 'view', fallback = null, children }: PermissionGateProps) {
  const { permission } = usePermission(moduleId);

  let hasAccess = false;
  switch (require) {
    case 'view':    hasAccess = canView(permission); break;
    case 'edit':    hasAccess = canEdit(permission); break;
    case 'approve': hasAccess = canApprove(permission); break;
    case 'delete':  hasAccess = canDelete(permission); break;
    case 'full':    hasAccess = permission === 'F'; break;
  }

  if (!hasAccess) return <>{fallback}</>;
  return <>{children}</>;
}

/**
 * A route-level guard that blocks access entirely and shows an Access Denied page.
 */
export function RouteGuard({ moduleId, children }: { moduleId: ModuleId; children: React.ReactNode }) {
  const { canSee } = usePermission(moduleId);

  if (!canSee) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Access Denied</h2>
        <p className="text-sm text-slate-500 max-w-md">
          Your current role does not have permission to access this module.
          Contact your System Administrator to request access.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
