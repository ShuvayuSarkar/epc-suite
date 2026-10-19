import React, { useState, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  ChevronDown, ChevronRight, HardHat,
  LayoutDashboard, FolderKanban, FileText, ShoppingCart, 
  Hammer, CheckCircle, DollarSign, FileSignature, 
  Users, TrendingUp, Gavel, Layers, Clock,
  Shield, LogOut, Settings, AlertTriangle, Truck,
  Zap, Package, ClipboardList, BookOpen, Search, MapPin
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../contexts/AuthContext';
import { canView, ModuleId, ROLES, STAGE_CONFIGS, canAccessStage } from '../../config/rbac';

interface NavItem {
  name: string;
  href: string;
  moduleId?: ModuleId;
}

interface NavGroup {
  title: string;
  icon: React.ElementType;
  /** Optional stage badge color for lifecycle groups */
  stageBadge?: string;
  items: NavItem[];
}

// ─── Navigation organized by EPC Lifecycle Stage ─────────────────────────────
const navGroups: NavGroup[] = [
  // ── Always visible ────────────────────────────────────────────────────────
  {
    title: 'OVERVIEW',
    icon: LayoutDashboard,
    items: [
      { name: 'Executive Dashboard', href: '/dashboard' },
    ]
  },

  // ── Stage 0: Bidding ──────────────────────────────────────────────────────
  {
    title: 'STAGE 0 — BIDDING',
    icon: Search,
    stageBadge: 'bg-slate-600',
    items: [
      { name: 'Bids & Tenders',       href: '/bidding',     moduleId: '4.1' },
      { name: 'Site Surveys (GPS)',    href: '/site-surveys', moduleId: '4.4' },
      { name: 'Projects Master',       href: '/projects',    moduleId: '4.1' },
    ]
  },

  // ── Stage 1: Award ────────────────────────────────────────────────────────
  {
    title: 'STAGE 1 — AWARD',
    icon: ClipboardList,
    stageBadge: 'bg-blue-700',
    items: [
      { name: 'Award & LOA',          href: '/award',       moduleId: '4.10' },
      { name: 'Contracts',            href: '/contracts',   moduleId: '4.10' },
    ]
  },

  // ── Stage 2: Golden Period ────────────────────────────────────────────────
  {
    title: 'STAGE 2 — GOLDEN PERIOD',
    icon: Layers,
    stageBadge: 'bg-amber-600',
    items: [
      { name: 'Golden Period',        href: '/golden-period',              moduleId: '4.14' },
      { name: 'Vendor Finalization',  href: '/golden-period/vendor-finalization', moduleId: '4.14' },
      { name: 'LOI / Mfg Clearance',  href: '/golden-period/manufacturing-clearance', moduleId: '4.14' },
      { name: 'Bank Guarantees',      href: '/golden-period/bank-guarantees', moduleId: '4.5' },
      { name: 'Insurance Tracker',    href: '/golden-period/insurance',    moduleId: '4.5' },
      { name: 'Statutory Verification', href: '/golden-period/statutory',  moduleId: '4.5' },
      { name: 'WBS / Baseline',       href: '/wbs',                        moduleId: '4.1' },
    ]
  },

  // ── Stage 3: Pre-Construction & Procurement ───────────────────────────────
  {
    title: 'STAGE 3 — PRE-CONSTRUCTION',
    icon: FolderKanban,
    stageBadge: 'bg-orange-600',
    items: [
      { name: 'Pre-Construction',     href: '/stage3',       moduleId: '4.1'  },
      { name: 'Procurement Overview', href: '/procurement',  moduleId: '4.14' },
      { name: 'Vendors Master',       href: '/procurement/vendors', moduleId: '4.14' },
      { name: 'Purchase Orders',      href: '/procurement/purchase-orders', moduleId: '4.14' },
      { name: 'Line Items & Dispatch', href: '/po-line-items', moduleId: '4.14' },
      { name: 'PO Amendments',        href: '/po-amendments', moduleId: '4.8'  },
      { name: 'Gangs',                href: '/gangs',        moduleId: '4.3'  },
      { name: 'Meetings (MOM)',        href: '/meetings',     moduleId: '4.22' },
      { name: 'Issues',               href: '/issues',       moduleId: '4.27' },
    ]
  },

  // ── Stage 4: Engineering ──────────────────────────────────────────────────
  {
    title: 'STAGE 4 — ENGINEERING',
    icon: FileText,
    stageBadge: 'bg-indigo-600',
    items: [
      { name: 'Engineering Docs',     href: '/engineering-docs', moduleId: '4.18' },
      { name: 'Transmittals',         href: '/transmittals',     moduleId: '4.23' },
      { name: 'Comment Response',     href: '/crs',              moduleId: '4.25' },
      { name: 'Deliverable Schedule', href: '/deliverables',     moduleId: '4.24' },
      { name: 'RFI',                  href: '/rfis',             moduleId: '4.21' },
      { name: 'Correspondence',       href: '/correspondence',   moduleId: '4.17' },
      { name: 'Statutory Approvals',  href: '/statutory-approvals', moduleId: '4.26' },
    ]
  },

  // ── Stage 5: Procurement & Construction ───────────────────────────────────
  {
    title: 'STAGE 5 — CONSTRUCTION',
    icon: Hammer,
    stageBadge: 'bg-green-700',
    items: [
      { name: 'Construction Dash',    href: '/stage5',        moduleId: '4.1'  },
      { name: 'Installation',         href: '/installation',  moduleId: '4.1'  },
      { name: 'DPR',                  href: '/installation/dpr', moduleId: '4.1' },
      { name: 'JMC',                  href: '/installation/jmc', moduleId: '4.1' },
      { name: 'Hotspot Register',     href: '/hotspots',      moduleId: '4.4'  },
      { name: 'Inventory & Store',    href: '/inventory',     moduleId: '4.15' },
      { name: 'Dispatch Planning',    href: '/inventory/dispatch', moduleId: '4.15' },
      { name: 'QA / QC',             href: '/qa-qc',         moduleId: '4.13' },
      { name: 'Inspections',          href: '/qa-qc/inspections', moduleId: '4.13' },
      { name: 'NCR Register',         href: '/qa-qc/ncrs',    moduleId: '4.13' },
      { name: 'Safety & HSE',         href: '/safety',        moduleId: '4.12' },
      { name: 'Safety Incidents',     href: '/safety/incidents', moduleId: '4.12' },
      { name: 'Safety Audits',        href: '/safety/audits', moduleId: '4.12' },
    ]
  },

  // ── Stage 6: Commissioning & Handover ─────────────────────────────────────
  {
    title: 'STAGE 6 — COMMISSIONING',
    icon: Zap,
    stageBadge: 'bg-teal-600',
    items: [
      { name: 'Commissioning',        href: '/commissioning', moduleId: '4.20' },
      { name: 'Finance',              href: '/finance',       moduleId: '4.7'  },
      { name: 'Bills',                href: '/finance/bills', moduleId: '4.7'  },
      { name: 'Budgets & Cost',       href: '/finance/budgets', moduleId: '4.7' },
    ]
  },

  // ── Stage 7: Post-Completion ──────────────────────────────────────────────
  {
    title: 'STAGE 7 — POST-COMPLETION',
    icon: TrendingUp,
    stageBadge: 'bg-purple-700',
    items: [
      { name: 'Collections',          href: '/collections',   moduleId: '4.2'  },
      { name: 'Invoices',             href: '/collections/invoices', moduleId: '4.2' },
      { name: 'EOT & Delay Claims',   href: '/eot',           moduleId: '4.6'  },
      { name: 'Delay Events',         href: '/eot/events',    moduleId: '4.6'  },
      { name: 'EOT Claims',           href: '/eot/claims',    moduleId: '4.6'  },
      { name: 'Risk Register',        href: '/risks',         moduleId: '4.9'  },
    ]
  },

  // ── Cross-Stage / Always available ────────────────────────────────────────
  {
    title: 'RESOURCES & HR',
    icon: Users,
    items: [
      { name: 'HR Dashboard',         href: '/hr',            moduleId: '4.11' },
      { name: 'Employees',            href: '/hr/employees',  moduleId: '4.11' },
      { name: 'Attendance',           href: '/hr/attendance', moduleId: '4.11' },
      { name: 'Assets & Resources',   href: '/resources',     moduleId: '4.16' },
      { name: 'Clients',              href: '/clients' },
    ]
  },

  // ── Admin ─────────────────────────────────────────────────────────────────
  {
    title: 'ADMIN',
    icon: Settings,
    items: [
      { name: 'RBAC & Users',         href: '/settings/admin', moduleId: '4.19' },
      { name: 'Settings',             href: '/settings',       moduleId: '4.19' },
    ]
  }
];

const Sidebar: React.FC = () => {
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({
    // Default collapse some stages to keep the sidebar manageable
    'STAGE 0 — BIDDING': false,
    'STAGE 1 — AWARD': false,
    'STAGE 2 — GOLDEN PERIOD': false,
    'STAGE 3 — PRE-CONSTRUCTION': false,
    'STAGE 4 — ENGINEERING': false,
    'STAGE 5 — CONSTRUCTION': false,
    'STAGE 6 — COMMISSIONING': false,
    'STAGE 7 — POST-COMPLETION': false,
    'RESOURCES & HR': true,
    'ADMIN': true,
  });
  const { user, logout, getEffectivePermission } = useAuth();
  const navigate = useNavigate();

  const toggleGroup = (title: string) => {
    setCollapsedGroups(prev => ({ ...prev, [title]: !prev[title] }));
  };

  // Filter nav items based on user's role permissions
  const filteredGroups = useMemo(() => {
    if (!user) return [];
    return navGroups.map(group => {
      const filteredItems = group.items.filter(item => {
        // System admin sees everything
        if (user.role === 'system_admin') return true;

        // No moduleId = always visible (Dashboard)
        if (!item.moduleId) return true;

        // Check module permission — null = no access = hidden
        const perm = getEffectivePermission(item.moduleId as ModuleId);
        return canView(perm);
      });
      return { ...group, items: filteredItems };
    }).filter(group => group.items.length > 0);
  }, [user, getEffectivePermission]);

  const roleLabel = ROLES.find(r => r.id === user?.role)?.label || user?.role || '';

  return (
    <aside className="w-64 bg-sidebar text-slate-300 flex flex-col h-full shrink-0">
      <div className="h-16 flex items-center px-4 font-bold text-white text-lg border-b border-slate-700 shrink-0">
        <HardHat className="mr-3 w-6 h-6 text-indigo-500" />
        EPC Suite
      </div>
      
      {/* User Info Bar */}
      {user && (
        <div className="px-3 py-3 border-b border-slate-700 bg-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user.name.split(' ').map(n => n[0]).join('').slice(0,2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-indigo-400 truncate">{roleLabel}</p>
            </div>
            <button onClick={() => { logout(); navigate('/login'); }}
              className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors" title="Logout">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto py-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-600">
        {filteredGroups.map((group) => {
          const isCollapsed = collapsedGroups[group.title];
          const Icon = group.icon;
          const isStageGroup = group.title.startsWith('STAGE');
          return (
            <div key={group.title} className="px-2 mb-1">
              <button 
                onClick={() => toggleGroup(group.title)}
                className={clsx(
                  'w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold uppercase tracking-wider hover:text-slate-200 transition-colors rounded-md',
                  isStageGroup 
                    ? 'text-slate-300 hover:bg-slate-700/50'
                    : 'text-slate-400'
                )}
              >
                <div className="flex items-center gap-2">
                  {group.stageBadge && (
                    <span className={clsx('w-1.5 h-4 rounded-full shrink-0', group.stageBadge)} />
                  )}
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{group.title}</span>
                </div>
                {isCollapsed ? <ChevronRight className="w-3.5 h-3.5 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 shrink-0" />}
              </button>
              
              {!isCollapsed && (
                <div className="mt-0.5 space-y-0.5 ml-2">
                  {group.items.map(item => (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      className={({ isActive }) =>
                        clsx(
                          'block px-7 py-1.5 text-sm rounded-md transition-colors',
                          isActive 
                            ? 'bg-indigo-600 text-white font-medium' 
                            : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                        )
                      }
                    >
                      {item.name}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
