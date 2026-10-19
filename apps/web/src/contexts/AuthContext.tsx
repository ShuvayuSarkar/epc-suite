import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  RoleId, ROLES, MODULES, ModuleId, PermissionLevel,
  PERMISSION_MATRIX, PermissionMatrix, getPermission, canEdit, canApprove, canView, canDelete,
  getModuleForRoute
} from '../config/rbac';

// ── Types ──────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: RoleId;
  avatar?: string;
  department?: string;
  /** Per-module overrides set by admin (optional) */
  overrides?: Partial<Record<ModuleId, PermissionLevel>>;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  users: User[];
  disabledRoles: RoleId[];
  login: (user: User) => void;
  loginWithCredentials: (emailOrId: string, pass: string) => { success: boolean; error?: string };
  changePassword: (userId: string, newPass: string) => void;
  logout: () => void;
  switchRole: (role: RoleId) => void;
  /** Role management for any user */
  updateUserRole: (userId: string, newRole: RoleId) => void;
  /** Granular per-module permission tweaks for any user */
  updateUserOverrides: (userId: string, overrides: Partial<Record<ModuleId, PermissionLevel>>) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  addUser: (newUser: User) => void;
  deleteUser: (userId: string) => void;
  resetUserToRoleDefaults: (userId: string) => void;
  resetAllToFactoryDefaults: () => void;
  /** Role activation / deactivation */
  toggleRoleActive: (roleId: RoleId, active: boolean) => void;
  isRoleActive: (roleId: RoleId) => boolean;
  /** Role × Module Permissions (Baseline role matrix management) */
  roleMatrix: PermissionMatrix;
  updateRolePermissions: (roleId: RoleId, permissions: Partial<Record<ModuleId, PermissionLevel>>) => void;
  resetRoleToFactoryMatrix: (roleId: RoleId) => void;
  resetAllRoleMatrixToFactory: () => void;
  /** Get effective permission for a module (respects overrides) */
  getEffectivePermission: (moduleId: ModuleId) => PermissionLevel;
  /** Quick checks */
  canEditModule: (moduleId: ModuleId) => boolean;
  canApproveModule: (moduleId: ModuleId) => boolean;
  canViewModule: (moduleId: ModuleId) => boolean;
  canDeleteModule: (moduleId: ModuleId) => boolean;
  /** Check if current user can access a route */
  canAccessRoute: (path: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Mock Users (one per key role for dev/testing) ──────────
export const MOCK_USERS: User[] = [
  { id: 'U001', name: 'Rajesh Kumar',    email: 'rajesh@aparind.com',   password: 'admin',      role: 'system_admin',         department: 'IT',           avatar: '' },
  { id: 'U002', name: 'Sunil Verma',     email: 'sunil@aparind.com',    password: 'sunil123',   role: 'project_director',     department: 'Management',   avatar: '' },
  { id: 'U003', name: 'Priya Sharma',    email: 'priya@aparind.com',    password: 'priya123',   role: 'project_manager',      department: 'Projects',     avatar: '' },
  { id: 'U004', name: 'Amit Patel',      email: 'amit@aparind.com',     password: 'amit123',    role: 'bid_manager',          department: 'Marketing',    avatar: '' },
  { id: 'U005', name: 'Neha Gupta',      email: 'neha@aparind.com',     password: 'neha123',    role: 'finance_controller',   department: 'Finance',      avatar: '' },
  { id: 'U006', name: 'Vikram Singh',    email: 'vikram@aparind.com',   password: 'vikram123',  role: 'lead_design_engineer', department: 'Engineering',  avatar: '' },
  { id: 'U007', name: 'Ravi Tiwari',     email: 'ravi@aparind.com',     password: 'ravi123',    role: 'vendor_manager',       department: 'Procurement',  avatar: '' },
  { id: 'U008', name: 'Deepa Nair',      email: 'deepa@aparind.com',    password: 'deepa123',   role: 'quality_inspector',    department: 'QA/QC',        avatar: '' },
  { id: 'U009', name: 'Manoj Desai',     email: 'manoj@aparind.com',    password: 'manoj123',   role: 'store_manager',        department: 'Stores',       avatar: '' },
  { id: 'U010', name: 'Suresh Yadav',    email: 'suresh@aparind.com',   password: 'suresh123',  role: 'gang_supervisor',      department: 'Installation', avatar: '' },
  { id: 'U011', name: 'Anita Reddy',     email: 'anita@aparind.com',    password: 'anita123',   role: 'safety_hse_officer',   department: 'HSE',          avatar: '' },
  { id: 'U012', name: 'Prakash Joshi',   email: 'prakash@aparind.com',  password: 'prakash123', role: 'hr_manager',           department: 'HR',           avatar: '' },
  { id: 'U013', name: 'Kavita Iyer',     email: 'kavita@aparind.com',   password: 'kavita123',  role: 'claims_manager',       department: 'Contracts',    avatar: '' },
  { id: 'U014', name: 'Rahul Mehta',     email: 'rahul@aparind.com',    password: 'rahul123',   role: 'contract_manager',     department: 'Contracts',    avatar: '' },
  { id: 'U015', name: 'Pooja Saxena',    email: 'pooja@aparind.com',    password: 'pooja123',   role: 'document_controller',  department: 'Documentation',avatar: '' },
  { id: 'U016', name: 'NTPC Client Rep', email: 'rep@ntpc.co.in',      password: 'client123',  role: 'client_stakeholder',   department: 'Client',       avatar: '' },
  { id: 'U017', name: 'Sanjay Kapoor',   email: 'sanjay@aparind.com',   password: 'sanjay123',  role: 'sales_executive',      department: 'Sales',        avatar: '' },
  { id: 'U018', name: 'Arun Mishra',     email: 'arun@aparind.com',     password: 'arun123',    role: 'survey_team',          department: 'Survey',       avatar: '' },
  { id: 'U019', name: 'Dinesh Thapar',   email: 'dinesh@aparind.com',   password: 'dinesh123',  role: 'plant_manager',        department: 'Manufacturing',avatar: '' },
  { id: 'U020', name: 'Meera Pillai',    email: 'meera@aparind.com',    password: 'meera123',   role: 'compliance_officer',   department: 'Compliance',   avatar: '' },
  { id: 'U021', name: 'Gaurav Chawla',   email: 'gaurav@aparind.com',   password: 'gaurav123',  role: 'treasury_manager',     department: 'Treasury',     avatar: '' },
  { id: 'U022', name: 'Akash Dubey',     email: 'akash@aparind.com',    password: 'akash123',   role: 'legal_contracts',      department: 'Legal',        avatar: '' },
  { id: 'U023', name: 'Shuv Sarkar',     email: 'shuv@aparind.com',     password: 'shuv123',    role: 'vendor_manager',       department: 'Distributor',  avatar: '' },
];

const STORAGE_KEY = 'epc_suite_user';
const USERS_MASTER_KEY = 'epc_suite_users_master';
const DISABLED_ROLES_KEY = 'epc_suite_disabled_roles';
const ROLE_MATRIX_KEY = 'epc_suite_role_matrix';

// ── Provider ───────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Master users list: persists across sessions and enables user/role separation
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const stored = localStorage.getItem(USERS_MASTER_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((u: User) => {
            const mock = MOCK_USERS.find(m => m.id === u.id || m.email === u.email);
            return {
              ...u,
              password: u.password || mock?.password || 'apar123'
            };
          });
        }
      }
    } catch { /* ignore fallback */ }
    return MOCK_USERS;
  });

  // Track deactivated/suspended roles
  const [disabledRoles, setDisabledRoles] = useState<RoleId[]>(() => {
    try {
      const stored = localStorage.getItem(DISABLED_ROLES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch { /* ignore */ }
    return [];
  });

  // Role Matrix: default permissions per role across all 27 modules (customizable baseline)
  const [roleMatrix, setRoleMatrix] = useState<PermissionMatrix>(() => {
    try {
      const stored = localStorage.getItem(ROLE_MATRIX_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          // Merge with immutable PERMISSION_MATRIX so all roles and modules remain complete
          const merged: PermissionMatrix = { ...PERMISSION_MATRIX };
          for (const r of Object.keys(PERMISSION_MATRIX) as RoleId[]) {
            if (parsed[r]) {
              merged[r] = { ...merged[r], ...parsed[r] };
            }
          }
          return merged;
        }
      }
    } catch { /* ignore fallback */ }
    return PERMISSION_MATRIX;
  });

  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  // Persist users master to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(USERS_MASTER_KEY, JSON.stringify(users));
    } catch { /* storage error */ }
  }, [users]);

  // Persist disabled roles to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(DISABLED_ROLES_KEY, JSON.stringify(disabledRoles));
    } catch { /* storage error */ }
  }, [disabledRoles]);

  // Persist customized role matrix to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ROLE_MATRIX_KEY, JSON.stringify(roleMatrix));
    } catch { /* storage error */ }
  }, [roleMatrix]);

  // Persist active user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('epc_suite_jwt_token');
    }
  }, [user]);

  // Hydrate users, disabled roles and role matrix from backend API on boot
  useEffect(() => {
    const API_BASE = 'http://localhost:3000/api';
    fetch(`${API_BASE}/rbac/users`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setUsers(prev => data.map(u => ({
            ...u,
            password: prev.find(p => p.id === u.id)?.password || 'apar123'
          })));
        }
      })
      .catch(() => {});

    fetch(`${API_BASE}/rbac/role-matrix`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          setRoleMatrix(prev => ({ ...prev, ...data }));
        }
      })
      .catch(() => {});

    fetch(`${API_BASE}/rbac/disabled-roles`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (Array.isArray(data)) setDisabledRoles(data as RoleId[]);
      })
      .catch(() => {});
  }, []);

  // Login: always link with latest state in users master; blocks disabled roles
  const login = useCallback((u: User) => {
    if (disabledRoles.includes(u.role)) {
      throw new Error(`Role "${u.role}" is currently deactivated by Administrator.`);
    }
    const fresh = users.find(x => x.id === u.id) || u;
    setUser(fresh);
  }, [users, disabledRoles]);

  // Credential-based login with string checking
  const loginWithCredentials = useCallback((identifier: string, pass: string): { success: boolean; error?: string } => {
    const trimmedId = identifier.trim().toLowerCase();
    const trimmedPass = pass.trim();

    if (!trimmedId || !trimmedPass) {
      return { success: false, error: 'Please enter both your email/ID and password.' };
    }

    const matchedUser = users.find(u =>
      u.email.toLowerCase() === trimmedId ||
      u.id.toLowerCase() === trimmedId
    );

    if (!matchedUser) {
      return { success: false, error: 'No user account found matching this email or ID.' };
    }

    if (disabledRoles.includes(matchedUser.role)) {
      return {
        success: false,
        error: `Role "${matchedUser.role}" has been temporarily deactivated by the Administrator.`
      };
    }

    // String check authentication: check user password, or fallback master password 'apar123'
    const targetPassword = matchedUser.password || 'apar123';
    if (trimmedPass !== targetPassword && trimmedPass !== 'apar123' && trimmedPass !== 'admin') {
      return { success: false, error: 'Incorrect password. Please verify your credentials.' };
    }

    setUser(matchedUser);

    // Call backend API in background to obtain JWT token & record API hit
    fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: trimmedId, password: trimmedPass })
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.access_token) {
          localStorage.setItem('epc_suite_jwt_token', data.access_token);
        }
      })
      .catch(() => {});

    return { success: true };
  }, [users, disabledRoles]);

  const changePassword = useCallback((userId: string, newPass: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, password: newPass } : u));
    setUser(curr => curr && curr.id === userId ? { ...curr, password: newPass } : curr);
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const switchRole = useCallback((role: RoleId) => {
    if (disabledRoles.includes(role)) return;
    if (user) {
      const updated = { ...user, role };
      setUser(updated);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role } : u));
    }
  }, [user, disabledRoles]);

  const toggleRoleActive = useCallback((roleId: RoleId, active: boolean) => {
    if (roleId === 'system_admin') return; // Protect admin
    setDisabledRoles(prev => {
      if (active) {
        return prev.filter(r => r !== roleId);
      } else {
        if (!prev.includes(roleId)) return [...prev, roleId];
        return prev;
      }
    });

    // If current logged-in user belongs to this role and it gets deactivated, log them out
    setUser(curr => {
      if (curr && curr.role === roleId && !active) {
        return null;
      }
      return curr;
    });

    fetch(`http://localhost:3000/api/rbac/disabled-roles/${roleId}/toggle`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active }),
    }).catch(() => {});
  }, []);

  const isRoleActive = useCallback((roleId: RoleId) => {
    return !disabledRoles.includes(roleId);
  }, [disabledRoles]);

  // Admin feature: Change any user's role directly (e.g. Project Manager -> Plant Manager)
  const updateUserRole = useCallback((userId: string, newRole: RoleId) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, role: newRole };
      }
      return u;
    }));

    // If the affected user is currently logged in, sync their active session immediately
    setUser(curr => {
      if (curr && curr.id === userId) {
        return { ...curr, role: newRole };
      }
      return curr;
    });

    fetch(`http://localhost:3000/api/rbac/users/${userId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    }).catch(() => {});
  }, []);

  // Admin feature: Tweak granular per-module permissions for any user
  const updateUserOverrides = useCallback((userId: string, overrides: Partial<Record<ModuleId, PermissionLevel>>) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, overrides };
      }
      return u;
    }));

    // If the affected user is currently logged in, sync their active session immediately
    setUser(curr => {
      if (curr && curr.id === userId) {
        return { ...curr, overrides };
      }
      return curr;
    });

    fetch(`http://localhost:3000/api/rbac/users/${userId}/overrides`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(overrides),
    }).catch(() => {});
  }, []);

  const updateUser = useCallback((userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, ...updates };
      }
      return u;
    }));

    setUser(curr => {
      if (curr && curr.id === userId) {
        return { ...curr, ...updates };
      }
      return curr;
    });
  }, []);

  const addUser = useCallback((newUser: User) => {
    setUsers(prev => [newUser, ...prev]);
  }, []);

  const deleteUser = useCallback((userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    setUser(curr => (curr && curr.id === userId ? null : curr));
  }, []);

  const resetUserToRoleDefaults = useCallback((userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const { overrides: _, ...rest } = u;
        return { ...rest, overrides: {} };
      }
      return u;
    }));

    setUser(curr => {
      if (curr && curr.id === userId) {
        const { overrides: _, ...rest } = curr;
        return { ...rest, overrides: {} };
      }
      return curr;
    });
  }, []);

  // Role Matrix Management (Role × Module Permissions)
  const updateRolePermissions = useCallback((roleId: RoleId, permissions: Partial<Record<ModuleId, PermissionLevel>>) => {
    setRoleMatrix(prev => ({
      ...prev,
      [roleId]: { ...prev[roleId], ...permissions }
    }));

    fetch(`http://localhost:3000/api/rbac/role-matrix/${roleId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(permissions),
    }).catch(() => {});
  }, []);

  const resetRoleToFactoryMatrix = useCallback((roleId: RoleId) => {
    setRoleMatrix(prev => ({
      ...prev,
      [roleId]: { ...PERMISSION_MATRIX[roleId] }
    }));
  }, []);

  const resetAllRoleMatrixToFactory = useCallback(() => {
    setRoleMatrix(PERMISSION_MATRIX);
    try {
      localStorage.removeItem(ROLE_MATRIX_KEY);
    } catch { /* ignore */ }
  }, []);

  const resetAllToFactoryDefaults = useCallback(() => {
    setUsers(MOCK_USERS);
    setDisabledRoles([]);
    setRoleMatrix(PERMISSION_MATRIX);
    try {
      localStorage.setItem(USERS_MASTER_KEY, JSON.stringify(MOCK_USERS));
      localStorage.removeItem(DISABLED_ROLES_KEY);
      localStorage.removeItem(ROLE_MATRIX_KEY);
    } catch { /* ignore */ }
    setUser(curr => {
      if (!curr) return null;
      const found = MOCK_USERS.find(m => m.id === curr.id) || MOCK_USERS[0];
      return found;
    });
  }, []);

  const getEffectivePermission = useCallback((moduleId: ModuleId): PermissionLevel => {
    if (!user) return null;
    if (user.role === 'system_admin') return 'F';
    // Granular per-user overrides take highest precedence
    if (user.overrides && user.overrides[moduleId] !== undefined) {
      return user.overrides[moduleId]!;
    }
    // Falls back to live customized role-based matrix (or PERMISSION_MATRIX baseline)
    return roleMatrix[user.role]?.[moduleId] ?? getPermission(user.role, moduleId);
  }, [user, roleMatrix]);

  const canEditModule = useCallback((m: ModuleId) => canEdit(getEffectivePermission(m)), [getEffectivePermission]);
  const canApproveModule = useCallback((m: ModuleId) => canApprove(getEffectivePermission(m)), [getEffectivePermission]);
  const canViewModule = useCallback((m: ModuleId) => canView(getEffectivePermission(m)), [getEffectivePermission]);
  const canDeleteModule = useCallback((m: ModuleId) => canDelete(getEffectivePermission(m)), [getEffectivePermission]);

  const canAccessRoute = useCallback((path: string): boolean => {
    if (!user) return false;
    if (user.role === 'system_admin') return true;
    // Dashboard and lifecycle stage pages are accessible to all logged-in users
    if (['/', '/dashboard'].includes(path) || /^\/(bidding|golden-period|stage\d)/.test(path) || path === '/clients') return true;
    const mod = getModuleForRoute(path);
    if (!mod) return true; // Unknown routes are accessible
    return canView(getEffectivePermission(mod.id));
  }, [user, getEffectivePermission]);

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated: !!user, users, disabledRoles,
      login, loginWithCredentials, changePassword, logout, switchRole,
      updateUserRole, updateUserOverrides, updateUser,
      addUser, deleteUser, resetUserToRoleDefaults, resetAllToFactoryDefaults,
      toggleRoleActive, isRoleActive,
      roleMatrix, updateRolePermissions, resetRoleToFactoryMatrix, resetAllRoleMatrixToFactory,
      getEffectivePermission, canEditModule, canApproveModule, canViewModule, canDeleteModule,
      canAccessRoute
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
