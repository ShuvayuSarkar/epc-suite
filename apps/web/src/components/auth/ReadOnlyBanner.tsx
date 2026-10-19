/**
 * ReadOnlyBanner — shown at the top of pages where user has R or V access.
 * Reminds the user they cannot edit and provides context about their role.
 */
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ModuleId, MODULES, permissionLabel, ROLES } from '../../config/rbac';
import { usePermission } from '../../hooks/usePermission';
import { Eye, Lock } from 'lucide-react';

interface ReadOnlyBannerProps {
  moduleId: ModuleId;
}

export function ReadOnlyBanner({ moduleId }: ReadOnlyBannerProps) {
  const { user } = useAuth();
  const { isReadOnly, permission, canCreate } = usePermission(moduleId);
  const moduleName = MODULES.find(m => m.id === moduleId)?.name ?? moduleId;
  const roleLabel = ROLES.find(r => r.id === user?.role)?.label ?? '';

  if (!isReadOnly || canCreate) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-amber-50 border border-amber-200 mb-4">
      <Eye size={16} className="text-amber-600 shrink-0" />
      <div className="text-xs text-amber-800">
        <strong>{permissionLabel(permission)}</strong> — Your role ({roleLabel}) has {permission === 'V' ? 'view-only' : 'read-only'} access to {moduleName}.
        Contact your System Administrator to request edit permissions.
      </div>
      <Lock size={14} className="text-amber-400 shrink-0 ml-auto" />
    </div>
  );
}
