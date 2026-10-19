import { useAuth } from '../contexts/AuthContext';
import { ModuleId, PermissionLevel, canEdit, canApprove, canView, canDelete } from '../config/rbac';

/**
 * Hook to get permission info for a specific BRD module.
 * 
 * Usage:
 *   const { permission, canCreate, canApprove, isReadOnly } = usePermission('4.7');
 *   if (canCreate) { ... show create button ... }
 */
export function usePermission(moduleId: ModuleId) {
  const { getEffectivePermission } = useAuth();
  const permission = getEffectivePermission(moduleId);

  return {
    permission,
    canCreate: canEdit(permission),
    canUpdate: canEdit(permission),
    canRemove: canDelete(permission),
    canApproveAction: canApprove(permission),
    canSee: canView(permission),
    isReadOnly: permission === 'R' || permission === 'V',
    isFullAccess: permission === 'F',
    isNoAccess: permission === null,
  };
}
