// InventoryList.tsx â€” Part 1
// BRD Stage 4: Â§4.7 Store Receipt + JVR, Â§4.8 Store Setup milestone,
//              Â§4.2 Drum-wise OPGW tracking, Â§4.3 Bay fabrication tracking
// Replaces the partial stub with full 5-tab implementation.

import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PermissionGate } from '../../components/auth/PermissionGate';
import { ReadOnlyBanner } from '../../components/auth/ReadOnlyBanner';
import { usePermission } from '../../hooks/usePermission';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend,
} from 'recharts';
import {
  Package, FileText,
  AlertTriangle, CheckCircle, Clock, Plus, MapPin,
  TrendingDown, Warehouse, Wrench, Pencil, Trash2, X, Truck
} from 'lucide-react';

import { ConfirmDeleteDialog } from '../../components/ui/ConfirmDeleteDialog';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';

// â”€â”€â”€ INTERFACES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface InventoryTabProps {
  canUpdate: boolean;
  canRemove: boolean;
  setEditRow: (r: any) => void;
  setDeleteRow: (r: any) => void;
  stock?: StockItem[];
  setStock?: React.Dispatch<React.SetStateAction<StockItem[]>>;
  grnData?: GrnRecord[];
  setGrnData?: React.Dispatch<React.SetStateAction<GrnRecord[]>>;
  drumData?: DrumRecord[];
  setDrumData?: React.Dispatch<React.SetStateAction<DrumRecord[]>>;
  bayData?: BayRecord[];
  setBayData?: React.Dispatch<React.SetStateAction<BayRecord[]>>;
  storeData?: StoreRecord[];
  setStoreData?: React.Dispatch<React.SetStateAction<StoreRecord[]>>;
}
interface StockItem {
  id: string;
  matCode: string;
  desc: string;
  category: string;
  location: string;
  qty: number;
  uom: string;
  reorderLevel: number;
  lastGrnDate: string;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

interface GrnRecord {
  id: string;
  grnNo: string;
  dispatchId: string;
  poNo: string;
  material: string;
  category: string;
  project: string;
  qtyOrdered: number;
  qtyReceived: number;
  qtyAccepted: number;
  uom: string;
  shortage: number;
  damage: number;
  drumCondition: 'Good' | 'Damaged' | 'Missing Labels';
  docsComplete: boolean;
  jvrStatus: 'Pending' | 'Completed' | 'Disputed';
  receiptDate: string;
  jvrDate?: string;
  clientInspector?: string;
  hoursElapsed: number;
}

interface DrumRecord {
  id: string;
  serial: string;
  poNo: string;
  lengthKm: number;
  weightMt: number;
  productionDate: string;
  dispatchDate?: string;
  arrivalDate?: string;
  otdrTest: 'Pass' | 'Fail' | 'Pending';
  spliceStatus: 'Not Started' | 'In Progress' | 'Spliced';
  location: string;
  stage: 'Manufactured' | 'Dispatched' | 'At Site' | 'OTDR Tested' | 'Spliced' | 'Complete';
  stageIndex: number;
}

interface BayRecord {
  id: string;
  bayId: string;
  bayType: 'B' | 'C' | 'E';
  substation: string;
  voltageLevel: string;
  vendor: string;
  fabricationStart: string;
  fabricationEnd?: string;
  qcStatus: 'Pending' | 'In Progress' | 'Approved' | 'Failed';
  dispatchStatus: 'Not Dispatched' | 'Dispatched';
  erectionStatus: 'Not Started' | 'In Progress' | 'Erected';
  progressPct: number;
}

interface StoreRecord {
  id: string;
  storeId: string;
  segment: string;
  siteLocation: string;
  gpsCoords: string;
  areaSqm: number;
  fencing: boolean;
  security: boolean;
  materialShed: boolean;
  setupDate?: string;
  commissioned: boolean;
  awardDate: string;
  daysFromAward: number;
  slaStatus: 'On Time' | 'Overdue' | 'Pending';
}

// â”€â”€â”€ MOCK DATA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// Â§4.7 Stock Register â€” 10 items across 5 categories
const STOCK_DATA: StockItem[] = [];

// Â§4.7 JVR / GRN â€” 8 records; g7 is JVR overdue (>48h Pending); g3,g4 disputed
const GRN_DATA: GrnRecord[] = [
  { id: 'g1', grnNo: 'GRN-2026-001', dispatchId: 'DSP-001', poNo: 'PO-2026-014', material: 'OPGW 48 Fibre', category: 'Cables', project: 'PRJ-NR-01', qtyOrdered: 5000, qtyReceived: 4980, qtyAccepted: 4980, uom: 'MTR', shortage: 20, damage: 0, drumCondition: 'Good', docsComplete: true, jvrStatus: 'Completed', receiptDate: '2026-09-18', jvrDate: '2026-09-18', clientInspector: 'Rajesh Kumar', hoursElapsed: 72 },
  { id: 'g2', grnNo: 'GRN-2026-002', dispatchId: 'DSP-002', poNo: 'PO-2026-015', material: 'Power Cable 33kV', category: 'Cables', project: 'PRJ-NR-01', qtyOrdered: 2000, qtyReceived: 2000, qtyAccepted: 2000, uom: 'MTR', shortage: 0, damage: 0, drumCondition: 'Good', docsComplete: true, jvrStatus: 'Completed', receiptDate: '2026-09-17', jvrDate: '2026-09-17', clientInspector: 'Sunil Mehta', hoursElapsed: 96 },
  { id: 'g3', grnNo: 'GRN-2026-003', dispatchId: 'DSP-003', poNo: 'PO-2026-016', material: 'Disc Insulator 70kN', category: 'Insulators', project: 'PRJ-WR-02', qtyOrdered: 1000, qtyReceived: 920, qtyAccepted: 900, uom: 'EA', shortage: 80, damage: 20, drumCondition: 'Good', docsComplete: false, jvrStatus: 'Disputed', receiptDate: '2026-09-15', jvrDate: '2026-09-16', clientInspector: 'Amit Sharma', hoursElapsed: 120 },
  { id: 'g4', grnNo: 'GRN-2026-004', dispatchId: 'DSP-004', poNo: 'PO-2026-017', material: 'SF6 Breaker 132kV', category: 'Switchgear', project: 'PRJ-WR-02', qtyOrdered: 4, qtyReceived: 3, qtyAccepted: 3, uom: 'EA', shortage: 1, damage: 0, drumCondition: 'Good', docsComplete: true, jvrStatus: 'Disputed', receiptDate: '2026-09-14', jvrDate: '2026-09-15', clientInspector: 'Priya Nair', hoursElapsed: 200 },
  { id: 'g5', grnNo: 'GRN-2026-005', dispatchId: 'DSP-005', poNo: 'PO-2026-018', material: 'Bay Structure Type-B', category: 'Bay Fabrication', project: 'PRJ-SR-03', qtyOrdered: 6, qtyReceived: 6, qtyAccepted: 6, uom: 'SET', shortage: 0, damage: 0, drumCondition: 'Good', docsComplete: true, jvrStatus: 'Completed', receiptDate: '2026-09-20', jvrDate: '2026-09-20', clientInspector: 'Kiran Patel', hoursElapsed: 48 },
  { id: 'g6', grnNo: 'GRN-2026-006', dispatchId: 'DSP-006', poNo: 'PO-2026-019', material: 'ACSR Moose Conductor', category: 'Cables', project: 'PRJ-SR-03', qtyOrdered: 3000, qtyReceived: 3000, qtyAccepted: 3000, uom: 'MTR', shortage: 0, damage: 0, drumCondition: 'Good', docsComplete: true, jvrStatus: 'Completed', receiptDate: '2026-09-21', jvrDate: '2026-09-21', clientInspector: 'Deepak Verma', hoursElapsed: 24 },
  { id: 'g7', grnNo: 'GRN-2026-007', dispatchId: 'DSP-007', poNo: 'PO-2026-020', material: 'Current Transformer 220kV', category: 'Switchgear', project: 'PRJ-NR-01', qtyOrdered: 3, qtyReceived: 1, qtyAccepted: 1, uom: 'EA', shortage: 2, damage: 0, drumCondition: 'Missing Labels', docsComplete: false, jvrStatus: 'Pending', receiptDate: '2026-09-20', hoursElapsed: 62 },
  { id: 'g8', grnNo: 'GRN-2026-008', dispatchId: 'DSP-008', poNo: 'PO-2026-021', material: 'Earthing Wire 50mm2', category: 'Earthing', project: 'PRJ-WR-02', qtyOrdered: 2000, qtyReceived: 2000, qtyAccepted: 2000, uom: 'MTR', shortage: 0, damage: 0, drumCondition: 'Good', docsComplete: true, jvrStatus: 'Pending', receiptDate: '2026-09-22', hoursElapsed: 18 },
];

// Â§4.2 Drum Tracking â€” 12 OPGW drums (Type D projects)
const DRUM_DATA: DrumRecord[] = [
  { id: 'd1', serial: 'DRM-OPGW-001', poNo: 'PO-2026-014', lengthKm: 4.2, weightMt: 1.8, productionDate: '2026-08-01', dispatchDate: '2026-08-15', arrivalDate: '2026-08-22', otdrTest: 'Pass', spliceStatus: 'Spliced', location: 'Tower 1-22 Span', stage: 'Complete', stageIndex: 5 },
  { id: 'd2', serial: 'DRM-OPGW-002', poNo: 'PO-2026-014', lengthKm: 3.8, weightMt: 1.6, productionDate: '2026-08-01', dispatchDate: '2026-08-15', arrivalDate: '2026-08-22', otdrTest: 'Pass', spliceStatus: 'Spliced', location: 'Tower 23-42 Span', stage: 'Complete', stageIndex: 5 },
  { id: 'd3', serial: 'DRM-OPGW-003', poNo: 'PO-2026-014', lengthKm: 4.0, weightMt: 1.7, productionDate: '2026-08-05', dispatchDate: '2026-08-18', arrivalDate: '2026-08-25', otdrTest: 'Pass', spliceStatus: 'In Progress', location: 'Store A - Awaiting splice', stage: 'Spliced', stageIndex: 4 },
  { id: 'd4', serial: 'DRM-OPGW-004', poNo: 'PO-2026-014', lengthKm: 4.5, weightMt: 1.9, productionDate: '2026-08-10', dispatchDate: '2026-08-22', arrivalDate: '2026-08-30', otdrTest: 'Pass', spliceStatus: 'Not Started', location: 'Store A - Bay 3', stage: 'OTDR Tested', stageIndex: 3 },
  { id: 'd5', serial: 'DRM-OPGW-005', poNo: 'PO-2026-014', lengthKm: 3.6, weightMt: 1.5, productionDate: '2026-08-12', dispatchDate: '2026-08-25', arrivalDate: '2026-09-02', otdrTest: 'Fail', spliceStatus: 'Not Started', location: 'Store A - Bay 3 (Hold)', stage: 'OTDR Tested', stageIndex: 3 },
  { id: 'd6', serial: 'DRM-OPGW-006', poNo: 'PO-2026-014', lengthKm: 4.1, weightMt: 1.75, productionDate: '2026-08-15', dispatchDate: '2026-08-28', arrivalDate: '2026-09-05', otdrTest: 'Pending', spliceStatus: 'Not Started', location: 'Store A - Bay 3', stage: 'At Site', stageIndex: 2 },
  { id: 'd7', serial: 'DRM-OPGW-007', poNo: 'PO-2026-014', lengthKm: 4.3, weightMt: 1.82, productionDate: '2026-08-18', dispatchDate: '2026-09-01', arrivalDate: '2026-09-08', otdrTest: 'Pending', spliceStatus: 'Not Started', location: 'Store A - Bay 3', stage: 'At Site', stageIndex: 2 },
  { id: 'd8', serial: 'DRM-OPGW-008', poNo: 'PO-2026-014', lengthKm: 3.9, weightMt: 1.65, productionDate: '2026-08-20', dispatchDate: '2026-09-05', arrivalDate: undefined, otdrTest: 'Pending', spliceStatus: 'Not Started', location: 'In Transit - Truck TN-01', stage: 'Dispatched', stageIndex: 1 },
  { id: 'd9', serial: 'DRM-OPGW-009', poNo: 'PO-2026-014', lengthKm: 4.4, weightMt: 1.88, productionDate: '2026-08-22', dispatchDate: '2026-09-08', arrivalDate: undefined, otdrTest: 'Pending', spliceStatus: 'Not Started', location: 'In Transit - Truck MH-04', stage: 'Dispatched', stageIndex: 1 },
  { id: 'd10', serial: 'DRM-OPGW-010', poNo: 'PO-2026-014', lengthKm: 4.0, weightMt: 1.70, productionDate: '2026-09-01', dispatchDate: undefined, arrivalDate: undefined, otdrTest: 'Pending', spliceStatus: 'Not Started', location: 'Manufacturer - Apar Silvassa', stage: 'Manufactured', stageIndex: 0 },
  { id: 'd11', serial: 'DRM-OPGW-011', poNo: 'PO-2026-014', lengthKm: 3.7, weightMt: 1.57, productionDate: '2026-09-05', dispatchDate: undefined, arrivalDate: undefined, otdrTest: 'Pending', spliceStatus: 'Not Started', location: 'Manufacturer - Apar Silvassa', stage: 'Manufactured', stageIndex: 0 },
  { id: 'd12', serial: 'DRM-OPGW-012', poNo: 'PO-2026-014', lengthKm: 4.2, weightMt: 1.78, productionDate: '2026-09-10', dispatchDate: undefined, arrivalDate: undefined, otdrTest: 'Pending', spliceStatus: 'Not Started', location: 'Manufacturer - Apar Silvassa', stage: 'Manufactured', stageIndex: 0 },
];

// Â§4.3 Bay Fabrication â€” 6 bays (Types B/C/E)
const BAY_DATA: BayRecord[] = [
  { id: 'b1', bayId: 'BAY-B-001', bayType: 'B', substation: 'Akola 132kV SS', voltageLevel: '132kV', vendor: 'Kalpataru Power', fabricationStart: '2026-07-01', fabricationEnd: '2026-08-15', qcStatus: 'Approved', dispatchStatus: 'Dispatched', erectionStatus: 'Erected', progressPct: 100 },
  { id: 'b2', bayId: 'BAY-B-002', bayType: 'B', substation: 'Amravati 132kV SS', voltageLevel: '132kV', vendor: 'Kalpataru Power', fabricationStart: '2026-07-10', fabricationEnd: '2026-08-25', qcStatus: 'Approved', dispatchStatus: 'Dispatched', erectionStatus: 'In Progress', progressPct: 80 },
  { id: 'b3', bayId: 'BAY-C-001', bayType: 'C', substation: 'Akola 132kV SS', voltageLevel: '132kV', vendor: 'BHEL', fabricationStart: '2026-07-15', fabricationEnd: '2026-09-01', qcStatus: 'Approved', dispatchStatus: 'Dispatched', erectionStatus: 'Not Started', progressPct: 65 },
  { id: 'b4', bayId: 'BAY-C-002', bayType: 'C', substation: 'Nagpur 220kV SS', voltageLevel: '220kV', vendor: 'BHEL', fabricationStart: '2026-08-01', fabricationEnd: undefined, qcStatus: 'In Progress', dispatchStatus: 'Not Dispatched', erectionStatus: 'Not Started', progressPct: 45 },
  { id: 'b5', bayId: 'BAY-E-001', bayType: 'E', substation: 'Nagpur 220kV SS', voltageLevel: '220kV', vendor: 'Siemens India', fabricationStart: '2026-08-10', fabricationEnd: undefined, qcStatus: 'In Progress', dispatchStatus: 'Not Dispatched', erectionStatus: 'Not Started', progressPct: 30 },
  { id: 'b6', bayId: 'BAY-E-002', bayType: 'E', substation: 'Wardha 220kV SS', voltageLevel: '220kV', vendor: 'Siemens India', fabricationStart: '2026-09-01', fabricationEnd: undefined, qcStatus: 'Pending', dispatchStatus: 'Not Dispatched', erectionStatus: 'Not Started', progressPct: 10 },
];

// Â§4.8 Store Setup â€” 4 stores; SLA = 15 days from award acceptance
const STORE_DATA: StoreRecord[] = [
  { id: 'st1', storeId: 'STR-NR-01', segment: 'Segment NR-1 (Akola)', siteLocation: 'Akola, Maharashtra', gpsCoords: '20.7002 N, 77.0082 E', areaSqm: 2400, fencing: true, security: true, materialShed: true, setupDate: '2026-07-20', commissioned: true, awardDate: '2026-07-10', daysFromAward: 10, slaStatus: 'On Time' },
  { id: 'st2', storeId: 'STR-NR-02', segment: 'Segment NR-2 (Amravati)', siteLocation: 'Amravati, Maharashtra', gpsCoords: '20.9374 N, 77.7796 E', areaSqm: 1800, fencing: true, security: false, materialShed: true, setupDate: '2026-07-28', commissioned: true, awardDate: '2026-07-10', daysFromAward: 18, slaStatus: 'Overdue' },
  { id: 'st3', storeId: 'STR-WR-01', segment: 'Segment WR-1 (Nagpur)', siteLocation: 'Nagpur, Maharashtra', gpsCoords: '21.1458 N, 79.0882 E', areaSqm: 3200, fencing: true, security: true, materialShed: false, commissioned: false, awardDate: '2026-09-01', daysFromAward: 22, slaStatus: 'Overdue' },
  { id: 'st4', storeId: 'STR-SR-01', segment: 'Segment SR-1 (Wardha)', siteLocation: 'Wardha, Maharashtra', gpsCoords: '20.7453 N, 78.6022 E', areaSqm: 2000, fencing: false, security: false, materialShed: false, commissioned: false, awardDate: '2026-09-15', daysFromAward: 8, slaStatus: 'Pending' },
];

// â”€â”€â”€ DERIVED CHART DATA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const stockByCategoryData = (() => {
  const map: Record<string, { inStock: number; lowStock: number; outOfStock: number }> = {};
  STOCK_DATA.forEach(s => {
    if (!map[s.category]) map[s.category] = { inStock: 0, lowStock: 0, outOfStock: 0 };
    if (s.status === 'IN_STOCK') map[s.category].inStock++;
    else if (s.status === 'LOW_STOCK') map[s.category].lowStock++;
    else map[s.category].outOfStock++;
  });
  return Object.entries(map).map(([cat, v]) => ({ cat, ...v }));
})();

// â”€â”€â”€ HELPER COMPONENTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const KpiCard: React.FC<{
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  sub?: string;
}> = ({ label, value, icon, color, sub }) => (
  <div className={`flex items-center gap-4 rounded-lg border p-4 ${color}`}>
    <div className="shrink-0">{icon}</div>
    <div>
      <p className="text-2xl font-bold leading-none">{value}</p>
      <p className="text-xs font-medium mt-1 opacity-80">{label}</p>
      {sub && <p className="text-xs opacity-60 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const FilterBar: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-wrap gap-3 items-end mb-4">{children}</div>
);

const SelectFilter: React.FC<{
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}> = ({ label, value, options, onChange }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-medium text-slate-500">{label}</label>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="text-sm border border-slate-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
    >
      <option value="ALL">All</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

// Drum stage progress bar â€” 6 stages (BRD Â§4.2)
const DRUM_STAGES = ['Manufactured', 'Dispatched', 'At Site', 'OTDR Tested', 'Spliced', 'Complete'];
const DrumProgressBar: React.FC<{ stageIndex: number }> = ({ stageIndex }) => (
  <div className="flex items-center gap-0.5 w-full min-w-[160px]">
    {DRUM_STAGES.map((s, i) => (
      <React.Fragment key={s}>
        <div
          title={s}
          className={`h-2 flex-1 rounded-sm transition-colors ${i <= stageIndex ? 'bg-indigo-500' : 'bg-slate-200'}`}
        />
        {i < DRUM_STAGES.length - 1 && <div className="w-px" />}
      </React.Fragment>
    ))}
  </div>
);

// Bay fabrication Gantt-style progress bar (BRD Â§4.3)
const BayProgressBar: React.FC<{ pct: number }> = ({ pct }) => (
  <div className="flex items-center gap-2 w-full min-w-[100px]">
    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${
          pct === 100 ? 'bg-green-500' : pct >= 60 ? 'bg-indigo-500' : pct >= 30 ? 'bg-amber-500' : 'bg-red-400'
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
    <span className="text-xs text-slate-600 w-8 text-right shrink-0">{pct}%</span>
  </div>
);

const TH: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap bg-slate-50">
    {children}
  </th>
);
const TD: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <td className={`px-3 py-2 text-sm ${className}`}>{children}</td>
);

// â”€â”€â”€ TAB 1: STOCK REGISTER (BRD Â§4.7) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

import { usePersistentState } from '../../hooks/usePersistentState';

const StockRegisterTab: React.FC<InventoryTabProps> = ({ canUpdate, canRemove, setEditRow, setDeleteRow, stock: propStock, setStock: propSetStock }) => {
  const [localStock, setLocalStock] = usePersistentState<StockItem[]>('epc_inventory_stock', STOCK_DATA);
  const stock = propStock || localStock;
  const setStock = propSetStock || setLocalStock;
  const [catFilter, setCatFilter] = useState('ALL');
  const [locFilter, setLocFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [newStock, setNewStock] = useState<Partial<StockItem>>({
    matCode: '',
    desc: '',
    category: 'Hardware',
    location: 'Central Store - Vadodara',
    qty: 100,
    uom: 'Nos',
    reorderLevel: 20,
    lastGrnDate: new Date().toISOString().split('T')[0],
    status: 'IN_STOCK'
  });

  const categories = [...new Set(stock.map(s => s.category))];
  const locations = [...new Set(stock.map(s => s.location))];

  const filtered = useMemo(() =>
    stock.filter(s =>
      (catFilter === 'ALL' || s.category === catFilter) &&
      (locFilter === 'ALL' || s.location === locFilter) &&
      (statusFilter === 'ALL' || s.status === statusFilter)
    ), [stock, catFilter, locFilter, statusFilter]);

  const kpis = {
    total: stock.length,
    inStock: stock.filter(s => s.status === 'IN_STOCK').length,
    lowStock: stock.filter(s => s.status === 'LOW_STOCK').length,
    outOfStock: stock.filter(s => s.status === 'OUT_OF_STOCK').length,
  };

  const handleCreateStock = () => {
    if (!newStock.matCode || !newStock.desc) {
      alert('Please fill in Material Code and Description');
      return;
    }
    const qtyVal = Number(newStock.qty) || 0;
    const reorderVal = Number(newStock.reorderLevel) || 10;
    const created: StockItem = {
      id: `STK-${Date.now().toString().slice(-4)}`,
      matCode: newStock.matCode,
      desc: newStock.desc,
      category: newStock.category || 'Hardware',
      location: newStock.location || 'Central Store - Vadodara',
      qty: qtyVal,
      uom: newStock.uom || 'Nos',
      reorderLevel: reorderVal,
      lastGrnDate: newStock.lastGrnDate || new Date().toISOString().split('T')[0],
      status: (qtyVal <= 0 ? 'OUT_OF_STOCK' : qtyVal <= reorderVal ? 'LOW_STOCK' : 'IN_STOCK')
    };
    setStock(prev => [created, ...prev]);
    setShowAddStockModal(false);
    setNewStock({
      matCode: '',
      desc: '',
      category: 'Hardware',
      location: 'Central Store - Vadodara',
      qty: 100,
      uom: 'Nos',
      reorderLevel: 20,
      lastGrnDate: new Date().toISOString().split('T')[0],
      status: 'IN_STOCK'
    });
  };

  const statusBadge = (status: StockItem['status']) => {
    const vmap: Record<StockItem['status'], 'success' | 'warning' | 'danger'> = {
      IN_STOCK: 'success', LOW_STOCK: 'warning', OUT_OF_STOCK: 'danger',
    };
    const labels: Record<StockItem['status'], string> = {
      IN_STOCK: 'In Stock', LOW_STOCK: 'Low Stock', OUT_OF_STOCK: 'Out of Stock',
    };
    return <Badge variant={vmap[status]}>{labels[status]}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total SKUs" value={kpis.total} icon={<Package className="w-8 h-8 text-indigo-600" />} color="bg-indigo-50 border-indigo-100 text-indigo-900" />
        <KpiCard label="In Stock" value={kpis.inStock} icon={<CheckCircle className="w-8 h-8 text-green-600" />} color="bg-green-50 border-green-100 text-green-900" />
        <KpiCard label="Low Stock" value={kpis.lowStock} icon={<TrendingDown className="w-8 h-8 text-amber-600" />} color="bg-amber-50 border-amber-100 text-amber-900" />
        <KpiCard label="Out of Stock" value={kpis.outOfStock} icon={<AlertTriangle className="w-8 h-8 text-red-600" />} color="bg-red-50 border-red-100 text-red-900" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filters + Table */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <FilterBar>
              <SelectFilter label="Category" value={catFilter} options={categories} onChange={setCatFilter} />
              <SelectFilter label="Location" value={locFilter} options={locations} onChange={setLocFilter} />
              <SelectFilter label="Status" value={statusFilter} options={['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK']} onChange={setStatusFilter} />
            </FilterBar>
            <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setShowAddStockModal(true)}>Add Stock</Button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead>
                <tr>
                  <TH>Material Code</TH>
                  <TH>Description</TH>
                  <TH>Category</TH>
                  <TH>Store Location</TH>
                  <TH>Qty on Hand</TH>
                  <TH>UOM</TH>
                  <TH>Reorder Lvl</TH>
                  <TH>Last GRN</TH>
                  <TH>Status</TH>
                {(canUpdate || canRemove) && <TH>Actions</TH>}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filtered.map(row => (
                  <tr
                    key={row.id}
                    className={
                      row.status === 'OUT_OF_STOCK' ? 'bg-red-50' :
                      row.status === 'LOW_STOCK' ? 'bg-amber-50' : ''
                    }
                  >
                    <TD className="font-mono text-xs text-slate-700 whitespace-nowrap">{row.matCode}</TD>
                    <TD className="text-slate-800 max-w-[160px] truncate" >{row.desc}</TD>
                    <TD className="text-slate-600 whitespace-nowrap">{row.category}</TD>
                    <TD className="text-slate-600 whitespace-nowrap">{row.location}</TD>
                    <TD className="font-semibold text-slate-800 whitespace-nowrap">{row.qty.toLocaleString()}</TD>
                    <TD className="text-slate-500">{row.uom}</TD>
                    <TD className="text-slate-500 whitespace-nowrap">{row.reorderLevel.toLocaleString()}</TD>
                    <TD className="text-slate-500 whitespace-nowrap">{row.lastGrnDate}</TD>
                    <TD>{statusBadge(row.status)}</TD>
                  {(canUpdate || canRemove) && (
                    <TD>
                      <div className="flex items-center gap-1">
                        {canUpdate && <button onClick={() => setEditRow(row)} className="p-1 text-slate-400 hover:text-indigo-600"><Pencil size={13}/></button>}
                        {canRemove && <button onClick={() => setDeleteRow(row)} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={13}/></button>}
                      </div>
                    </TD>
                  )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-400">{filtered.length} of {STOCK_DATA.length} SKUs shown</p>
        </div>

        {/* Bar Chart */}
        <div>
          <Card title="Stock Status by Category">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={stockByCategoryData} layout="vertical" margin={{ top: 0, right: 10, left: 70, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="cat" type="category" tick={{ fontSize: 10 }} width={65} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="inStock" name="In Stock" stackId="a" fill="#22c55e" />
                <Bar dataKey="lowStock" name="Low Stock" stackId="a" fill="#f59e0b" />
                <Bar dataKey="outOfStock" name="Out of Stock" stackId="a" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>

      
      {/* Add Stock Modal */}
      {showAddStockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Add New Stock Item</h3>
              <button onClick={() => setShowAddStockModal(false)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Material Code *</label>
                  <input
                    value={newStock.matCode || ''}
                    onChange={e => setNewStock({ ...newStock, matCode: e.target.value })}
                    placeholder="e.g. MAT-INS-01"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
                  <input
                    value={newStock.category || ''}
                    onChange={e => setNewStock({ ...newStock, category: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Description *</label>
                <input
                  value={newStock.desc || ''}
                  onChange={e => setNewStock({ ...newStock, desc: e.target.value })}
                  placeholder="e.g. Disc Insulator 160kN"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Qty</label>
                  <input
                    type="number"
                    value={newStock.qty || 0}
                    onChange={e => setNewStock({ ...newStock, qty: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">UoM</label>
                  <input
                    value={newStock.uom || ''}
                    onChange={e => setNewStock({ ...newStock, uom: e.target.value })}
                    placeholder="Nos / MT / km"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Reorder Level</label>
                  <input
                    type="number"
                    value={newStock.reorderLevel || 0}
                    onChange={e => setNewStock({ ...newStock, reorderLevel: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Store Location</label>
                <input
                  value={newStock.location || ''}
                  onChange={e => setNewStock({ ...newStock, location: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-200">
              <button onClick={() => setShowAddStockModal(false)} className="flex-1 px-4 py-2 text-sm text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={handleCreateStock} className="flex-1 px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Add Stock</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// â”€â”€â”€ TAB 2: JVR / GRN (BRD Â§4.7 / Â§4.5) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const JvrGrnTab: React.FC<InventoryTabProps> = ({ canUpdate, canRemove, setEditRow, setDeleteRow, grnData }) => {
  const grnList = grnData || GRN_DATA;
  const [projectFilter, setProjectFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showJvrModal, setShowJvrModal] = useState(false);

  const projects = [...new Set(grnList.map(g => g.project))];
  const categories = [...new Set(grnList.map(g => g.category))];

  const filtered = useMemo(() =>
    grnList.filter(g =>
      (projectFilter === 'ALL' || g.project === projectFilter) &&
      (categoryFilter === 'ALL' || g.category === categoryFilter) &&
      (statusFilter === 'ALL' || g.jvrStatus === statusFilter)
    ), [grnList, projectFilter, categoryFilter, statusFilter]);

  const kpis = {
    thisMonth: grnList.length,
    jvrPending: grnList.filter(g => g.jvrStatus === 'Pending' && g.hoursElapsed <= 48).length,
    jvrOverdue: grnList.filter(g => g.jvrStatus === 'Pending' && g.hoursElapsed > 48).length,
    discrepancies: grnList.filter(g => g.shortage > 0 || g.damage > 0).length,
  };

  const isOverdue = (g: GrnRecord) => g.jvrStatus === 'Pending' && g.hoursElapsed > 48;
  const hasDiscrepancy = (g: GrnRecord) => g.qtyAccepted < g.qtyOrdered;

  const jvrBadge = (g: GrnRecord) => {
    if (isOverdue(g)) return <Badge variant="danger">Overdue</Badge>;
    if (g.jvrStatus === 'Pending') return <Badge variant="warning">Pending</Badge>;
    if (g.jvrStatus === 'Completed') return <Badge variant="success">Completed</Badge>;
    return <Badge variant="secondary">Disputed</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* BRD Note Card */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <AlertTriangle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-800">BRD Â§4.5 â€” JVR Completion Requirement</p>
          <p className="text-xs text-blue-700 mt-0.5">
            Joint Verification Report (JVR) must be completed and signed by client inspector within
            <strong> 48 hours</strong> of material receipt at site. Overdue JVRs are flagged in red.
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="GRNs This Month" value={kpis.thisMonth} icon={<FileText className="w-8 h-8 text-indigo-600" />} color="bg-indigo-50 border-indigo-100 text-indigo-900" />
        <KpiCard label="JVR Pending (within 48h)" value={kpis.jvrPending} icon={<Clock className="w-8 h-8 text-amber-600" />} color="bg-amber-50 border-amber-100 text-amber-900" />
        <KpiCard label="JVR Overdue (>48h)" value={kpis.jvrOverdue} icon={<AlertTriangle className="w-8 h-8 text-red-600" />} color="bg-red-50 border-red-100 text-red-900" />
        <KpiCard label="Discrepancies Found" value={kpis.discrepancies} icon={<AlertTriangle className="w-8 h-8 text-orange-600" />} color="bg-orange-50 border-orange-100 text-orange-900" />
      </div>

      {/* Discrepancy Alert */}
      {kpis.discrepancies > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-sm text-red-700">
            <strong>{kpis.discrepancies} GRN(s)</strong> have short-landing or damage â€” short-landing action required per BRD Â§4.7.
          </p>
        </div>
      )}

      {/* Filters + Create JVR */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <FilterBar>
          <SelectFilter label="Project" value={projectFilter} options={projects} onChange={setProjectFilter} />
          <SelectFilter label="Category" value={categoryFilter} options={categories} onChange={setCategoryFilter} />
          <SelectFilter label="JVR Status" value={statusFilter} options={['Pending', 'Completed', 'Disputed']} onChange={setStatusFilter} />
        </FilterBar>
        <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setShowJvrModal(true)}>Create JVR</Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead>
            <tr>
              <TH>GRN No.</TH>
              <TH>Dispatch ID</TH>
              <TH>PO No.</TH>
              <TH>Material</TH>
              <TH>Qty Ord.</TH>
              <TH>Qty Recd.</TH>
              <TH>Qty Accp.</TH>
              <TH>Shortage</TH>
                {(canUpdate || canRemove) && <TH>Actions</TH>}
              <TH>Damage</TH>
              <TH>Drum Cond.</TH>
              <TH>Docs</TH>
              <TH>JVR Status</TH>
              <TH>JVR Date</TH>
              <TH>Inspector</TH>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {filtered.map(row => (
              <tr key={row.id} className={isOverdue(row) ? 'bg-red-50' : hasDiscrepancy(row) ? 'bg-orange-50' : ''}>
                <TD className="font-mono text-xs whitespace-nowrap text-indigo-700 font-semibold">{row.grnNo}</TD>
                <TD className="font-mono text-xs whitespace-nowrap text-slate-600">{row.dispatchId}</TD>
                <TD className="font-mono text-xs whitespace-nowrap text-slate-600">{row.poNo}</TD>
                <TD className="text-slate-800 whitespace-nowrap">{row.material}</TD>
                <TD className="text-slate-600 whitespace-nowrap">{row.qtyOrdered.toLocaleString()} {row.uom}</TD>
                <TD className="text-slate-600 whitespace-nowrap">{row.qtyReceived.toLocaleString()}</TD>
                <TD className="font-semibold text-slate-800 whitespace-nowrap">{row.qtyAccepted.toLocaleString()}</TD>
                <TD className={`whitespace-nowrap font-semibold ${row.shortage > 0 ? 'text-red-700' : 'text-slate-400'}`}>{row.shortage}</TD>
                <TD className={`whitespace-nowrap font-semibold ${row.damage > 0 ? 'text-orange-700' : 'text-slate-400'}`}>{row.damage}</TD>
                <TD>
                  <Badge variant={row.drumCondition === 'Good' ? 'success' : row.drumCondition === 'Damaged' ? 'danger' : 'warning'}>
                    {row.drumCondition}
                  </Badge>
                </TD>
                <TD>
                  <Badge variant={row.docsComplete ? 'success' : 'danger'}>{row.docsComplete ? 'Yes' : 'No'}</Badge>
                </TD>
                <TD>{jvrBadge(row)}</TD>
                <TD className="text-slate-500 whitespace-nowrap">{row.jvrDate ?? '-'}</TD>
                <TD className="text-slate-600 whitespace-nowrap">{row.clientInspector ?? '-'}</TD>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-400">{filtered.length} of {GRN_DATA.length} GRNs shown</p>

      {/* Create JVR Modal (simplified inline) */}
      {showJvrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Create JVR / GRN</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {['GRN No.', 'Dispatch ID', 'PO No.', 'Material', 'Qty Ordered', 'Qty Received', 'Qty Accepted', 'Client Inspector'].map(f => (
                <div key={f} className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-500">{f}</label>
                  <input className="border border-slate-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder={f} />
                </div>
              ))}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-500">Drum Condition</label>
                <select className="border border-slate-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400">
                  <option>Good</option><option>Damaged</option><option>Missing Labels</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-500">Docs Complete</label>
                <select className="border border-slate-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400">
                  <option>Yes</option><option>No</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowJvrModal(false)}>Cancel</Button>
              <Button onClick={() => setShowJvrModal(false)}>Submit JVR</Button>
            </div>
          </div>
        </div>
      )}

      
    </div>
  );
};

// â”€â”€â”€ TAB 3: DRUM TRACKING (BRD Â§4.2 â€” OPGW, Type D projects) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const DrumTrackingTab: React.FC<InventoryTabProps> = ({ canUpdate, canRemove, setEditRow, setDeleteRow, drumData }) => {
  const drumList = drumData || DRUM_DATA;
  const [stageFilter, setStageFilter] = useState('ALL');
  const [otdrFilter, setOtdrFilter] = useState('ALL');

  const stages = [...new Set(drumList.map(d => d.stage))];

  const filtered = useMemo(() =>
    drumList.filter(d =>
      (stageFilter === 'ALL' || d.stage === stageFilter) &&
      (otdrFilter === 'ALL' || d.otdrTest === otdrFilter)
    ), [drumList, stageFilter, otdrFilter]);

  const kpis = {
    total: drumList.length,
    produced: drumList.filter(d => d.stageIndex >= 0).length,
    dispatched: drumList.filter(d => d.stageIndex >= 1).length,
    atSite: drumList.filter(d => d.stageIndex >= 2).length,
    spliced: drumList.filter(d => d.stageIndex >= 4).length,
  };

  const otdrBadge = (test: DrumRecord['otdrTest']) => {
    const vmap: Record<DrumRecord['otdrTest'], 'success' | 'danger' | 'warning'> = {
      Pass: 'success', Fail: 'danger', Pending: 'warning',
    };
    return <Badge variant={vmap[test]}>{test}</Badge>;
  };

  const spliceBadge = (s: DrumRecord['spliceStatus']) => {
    const vmap: Record<DrumRecord['spliceStatus'], 'success' | 'primary' | 'secondary'> = {
      Spliced: 'success', 'In Progress': 'primary', 'Not Started': 'secondary',
    };
    return <Badge variant={vmap[s]}>{s}</Badge>;
  };

  const stageBadge = (stage: DrumRecord['stage']) => {
    const vmap: Record<DrumRecord['stage'], 'secondary' | 'warning' | 'info' | 'primary' | 'success' | 'default'> = {
      Manufactured: 'secondary',
      Dispatched: 'warning',
      'At Site': 'primary',
      'OTDR Tested': 'default',
      Spliced: 'success',
      Complete: 'success',
    };
    return <Badge variant={vmap[stage] as 'success' | 'warning' | 'danger' | 'secondary' | 'primary' | 'outline' | 'default'}>{stage}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Context Note */}
      <div className="flex items-start gap-3 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <AlertTriangle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-indigo-800">BRD Â§4.2 â€” Drum-wise OPGW Tracking (Type D Projects)</p>
          <p className="text-xs text-indigo-700 mt-0.5">
            Each OPGW drum carries a unique serial number. Tracking covers production â†’ dispatch â†’ arrival â†’
            OTDR test â†’ splice â†’ complete. OTDR test result must be Pass before splicing proceeds.
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard label="Total Drums Ordered" value={kpis.total} icon={<Package className="w-7 h-7 text-indigo-600" />} color="bg-indigo-50 border-indigo-100 text-indigo-900" />
        <KpiCard label="Produced" value={kpis.produced} icon={<CheckCircle className="w-7 h-7 text-slate-600" />} color="bg-slate-50 border-slate-200 text-slate-900" />
        <KpiCard label="Dispatched" value={kpis.dispatched} icon={<Clock className="w-7 h-7 text-amber-600" />} color="bg-amber-50 border-amber-100 text-amber-900" />
        <KpiCard label="Received at Site" value={kpis.atSite} icon={<MapPin className="w-7 h-7 text-blue-600" />} color="bg-blue-50 border-blue-100 text-blue-900" />
        <KpiCard label="Spliced" value={kpis.spliced} icon={<CheckCircle className="w-7 h-7 text-green-600" />} color="bg-green-50 border-green-100 text-green-900" />
      </div>

      {/* Filters */}
      <FilterBar>
        <SelectFilter label="Stage" value={stageFilter} options={stages} onChange={setStageFilter} />
        <SelectFilter label="OTDR Test" value={otdrFilter} options={['Pass', 'Fail', 'Pending']} onChange={setOtdrFilter} />
      </FilterBar>

      {/* Stage Legend */}
      <div className="flex flex-wrap gap-2 text-xs text-slate-500 items-center">
        <span className="font-medium text-slate-600">Stage progress:</span>
        {DRUM_STAGES.map((s, i) => (
          <span key={s} className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-sm bg-indigo-500 opacity-100" style={{ opacity: (i + 1) / DRUM_STAGES.length }} />
            {i + 1}. {s}
          </span>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead>
            <tr>
              <TH>Drum Serial</TH>
              <TH>PO No.</TH>
              <TH>Length (km)</TH>
              <TH>Weight (MT)</TH>
              <TH>Prod. Date</TH>
              <TH>Dispatch Date</TH>
              <TH>Arrival Date</TH>
              <TH>OTDR Test</TH>
                {(canUpdate || canRemove) && <TH>Actions</TH>}
              <TH>Splice Status</TH>
              <TH>Stage</TH>
              <TH>Progress</TH>
              <TH>Location</TH>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {filtered.map(row => (
              <tr key={row.id} className={row.otdrTest === 'Fail' ? 'bg-red-50' : ''}>
                <TD className="font-mono text-xs whitespace-nowrap font-semibold text-indigo-700">{row.serial}</TD>
                <TD className="font-mono text-xs whitespace-nowrap text-slate-600">{row.poNo}</TD>
                <TD className="text-slate-700 whitespace-nowrap">{row.lengthKm.toFixed(1)}</TD>
                <TD className="text-slate-700 whitespace-nowrap">{row.weightMt.toFixed(2)}</TD>
                <TD className="text-slate-500 whitespace-nowrap">{row.productionDate}</TD>
                <TD className="text-slate-500 whitespace-nowrap">{row.dispatchDate ?? '-'}</TD>
                <TD className="text-slate-500 whitespace-nowrap">{row.arrivalDate ?? '-'}</TD>
                <TD>{otdrBadge(row.otdrTest)}</TD>
                  {(canUpdate || canRemove) && (
                    <TD>
                      <div className="flex items-center gap-1">
                        {canUpdate && <button onClick={() => setEditRow(row)} className="p-1 text-slate-400 hover:text-indigo-600"><Pencil size={13}/></button>}
                        {canRemove && <button onClick={() => setDeleteRow(row)} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={13}/></button>}
                      </div>
                    </TD>
                  )}
                <TD>{spliceBadge(row.spliceStatus)}</TD>
                <TD>{stageBadge(row.stage)}</TD>
                <TD className="min-w-[160px]"><DrumProgressBar stageIndex={row.stageIndex} /></TD>
                <TD className="text-slate-600 whitespace-nowrap max-w-[160px] truncate" >{row.location}</TD>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-400">{filtered.length} of {DRUM_DATA.length} drums shown</p>

      
    </div>
  );
};

// â”€â”€â”€ TAB 4: BAY FABRICATION (BRD Â§4.3 â€” Types B/C/E) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const BayFabricationTab: React.FC<InventoryTabProps> = ({ canUpdate, canRemove, setEditRow, setDeleteRow, bayData }) => {
  const bayList = bayData || BAY_DATA;
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [qcFilter, setQcFilter] = useState('ALL');

  const filtered = useMemo(() =>
    bayList.filter(b =>
      (typeFilter === 'ALL' || b.bayType === typeFilter) &&
      (qcFilter === 'ALL' || b.qcStatus === qcFilter)
    ), [bayList, typeFilter, qcFilter]);

  const kpis = {
    total: bayList.length,
    underFab: bayList.filter(b => b.qcStatus === 'In Progress' || b.qcStatus === 'Pending').length,
    qcApproved: bayList.filter(b => b.qcStatus === 'Approved').length,
    dispatched: bayList.filter(b => b.dispatchStatus === 'Dispatched').length,
    erected: bayList.filter(b => b.erectionStatus === 'Erected').length,
  };

  const qcBadge = (s: BayRecord['qcStatus']) => {
    const vmap: Record<BayRecord['qcStatus'], 'success' | 'primary' | 'warning' | 'danger'> = {
      Approved: 'success', 'In Progress': 'primary', Pending: 'warning', Failed: 'danger',
    };
    return <Badge variant={vmap[s]}>{s}</Badge>;
  };

  const dispatchBadge = (s: BayRecord['dispatchStatus']) =>
    <Badge variant={s === 'Dispatched' ? 'success' : 'secondary'}>{s}</Badge>;

  const erectionBadge = (s: BayRecord['erectionStatus']) => {
    const vmap: Record<BayRecord['erectionStatus'], 'success' | 'primary' | 'secondary'> = {
      Erected: 'success', 'In Progress': 'primary', 'Not Started': 'secondary',
    };
    return <Badge variant={vmap[s]}>{s}</Badge>;
  };

  const typeBadge = (t: 'B' | 'C' | 'E') => {
    const labels = { B: 'Type B â€“ Line Bay', C: 'Type C â€“ Bus Coupler', E: 'Type E â€“ Transformer Bay' };
    const variants: Record<string, 'primary' | 'warning' | 'danger'> = { B: 'primary', C: 'warning', E: 'danger' };
    return <Badge variant={variants[t]}>{labels[t]}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Context Note */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4">
        <Wrench className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800">BRD Â§4.3 â€” Bay Fabrication Tracking (Types B, C, E)</p>
          <p className="text-xs text-amber-700 mt-0.5">
            Type B = Line Bay | Type C = Bus Coupler Bay | Type E = Transformer Bay.
            Each bay tracks fabrication progress through QC approval, dispatch, and erection milestones.
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard label="Total Bays Ordered" value={kpis.total} icon={<Wrench className="w-7 h-7 text-indigo-600" />} color="bg-indigo-50 border-indigo-100 text-indigo-900" />
        <KpiCard label="Under Fabrication" value={kpis.underFab} icon={<Clock className="w-7 h-7 text-amber-600" />} color="bg-amber-50 border-amber-100 text-amber-900" />
        <KpiCard label="QC Approved" value={kpis.qcApproved} icon={<CheckCircle className="w-7 h-7 text-green-600" />} color="bg-green-50 border-green-100 text-green-900" />
        <KpiCard label="Dispatched" value={kpis.dispatched} icon={<Package className="w-7 h-7 text-blue-600" />} color="bg-blue-50 border-blue-100 text-blue-900" />
        <KpiCard label="Erected" value={kpis.erected} icon={<CheckCircle className="w-7 h-7 text-emerald-600" />} color="bg-emerald-50 border-emerald-100 text-emerald-900" />
      </div>

      {/* Filters */}
      <FilterBar>
        <SelectFilter label="Bay Type" value={typeFilter} options={['B', 'C', 'E']} onChange={setTypeFilter} />
        <SelectFilter label="QC Status" value={qcFilter} options={['Pending', 'In Progress', 'Approved', 'Failed']} onChange={setQcFilter} />
      </FilterBar>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead>
            <tr>
              <TH>Bay ID</TH>
              <TH>Bay Type</TH>
              <TH>Substation</TH>
              <TH>Voltage</TH>
              <TH>Vendor</TH>
              <TH>Fab. Start</TH>
              <TH>Fab. End</TH>
              <TH>QC Status</TH>
                {(canUpdate || canRemove) && <TH>Actions</TH>}
              <TH>Dispatch</TH>
              <TH>Erection</TH>
              <TH>Progress</TH>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {filtered.map(row => (
              <tr key={row.id}>
                <TD className="font-mono text-xs font-semibold text-indigo-700 whitespace-nowrap">{row.bayId}</TD>
                <TD>{typeBadge(row.bayType)}</TD>
                <TD className="text-slate-700 whitespace-nowrap">{row.substation}</TD>
                <TD className="text-slate-600 whitespace-nowrap">{row.voltageLevel}</TD>
                <TD className="text-slate-600 whitespace-nowrap">{row.vendor}</TD>
                <TD className="text-slate-500 whitespace-nowrap">{row.fabricationStart}</TD>
                <TD className="text-slate-500 whitespace-nowrap">{row.fabricationEnd ?? 'In Progress'}</TD>
                <TD>{qcBadge(row.qcStatus)}</TD>
                  {(canUpdate || canRemove) && (
                    <TD>
                      <div className="flex items-center gap-1">
                        {canUpdate && <button onClick={() => setEditRow(row)} className="p-1 text-slate-400 hover:text-indigo-600"><Pencil size={13}/></button>}
                        {canRemove && <button onClick={() => setDeleteRow(row)} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={13}/></button>}
                      </div>
                    </TD>
                  )}
                <TD>{dispatchBadge(row.dispatchStatus)}</TD>
                <TD>{erectionBadge(row.erectionStatus)}</TD>
                <TD className="min-w-[140px]"><BayProgressBar pct={row.progressPct} /></TD>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-400">{filtered.length} of {BAY_DATA.length} bays shown</p>

      
    </div>
  );
};

// â”€â”€â”€ TAB 5: STORE SETUP (BRD Â§4.8) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const StoreSetupTab: React.FC<InventoryTabProps> = ({ canUpdate, canRemove, setEditRow, setDeleteRow, storeData }) => {
  const storeList = storeData || STORE_DATA;
  const [segmentFilter, setSegmentFilter] = useState('ALL');
  const [slaFilter, setSlaFilter] = useState('ALL');
  const [showCommissionForm, setShowCommissionForm] = useState(false);
  const [selectedStore, setSelectedStore] = useState<StoreRecord | null>(null);

  const segments = [...new Set(storeList.map(s => s.segment))];

  const filtered = useMemo(() =>
    storeList.filter(s =>
      (segmentFilter === 'ALL' || s.segment === segmentFilter) &&
      (slaFilter === 'ALL' || s.slaStatus === slaFilter)
    ), [storeList, segmentFilter, slaFilter]);

  const kpis = {
    commissioned: storeList.filter(s => s.commissioned).length,
    pending: storeList.filter(s => !s.commissioned && s.slaStatus === 'Pending').length,
    overdue: storeList.filter(s => s.slaStatus === 'Overdue').length,
  };

  const slaBadge = (s: StoreRecord['slaStatus']) => {
    const vmap: Record<StoreRecord['slaStatus'], 'success' | 'danger' | 'warning'> = {
      'On Time': 'success', Overdue: 'danger', Pending: 'warning',
    };
    return <Badge variant={vmap[s]}>{s}</Badge>;
  };

  const boolBadge = (v: boolean) =>
    <Badge variant={v ? 'success' : 'secondary'}>{v ? 'Yes' : 'No'}</Badge>;

  return (
    <div className="space-y-6">
      {/* Context Note */}
      <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
        <Warehouse className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-green-800">BRD Â§4.8 â€” Store Setup Milestone</p>
          <p className="text-xs text-green-700 mt-0.5">
            Each segment store must be commissioned within <strong>15 days</strong> of award acceptance.
            Requirements: fencing, security guard, material shed, and GPS-surveyed location.
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard label="Stores Commissioned" value={kpis.commissioned} icon={<CheckCircle className="w-8 h-8 text-green-600" />} color="bg-green-50 border-green-100 text-green-900" />
        <KpiCard label="Setup Pending" value={kpis.pending} icon={<Clock className="w-8 h-8 text-amber-600" />} color="bg-amber-50 border-amber-100 text-amber-900" />
        <KpiCard label="SLA Overdue (>15 days)" value={kpis.overdue} icon={<AlertTriangle className="w-8 h-8 text-red-600" />} color="bg-red-50 border-red-100 text-red-900" sub="SLA: 15 days from award acceptance" />
      </div>

      {/* Filters + Commission Button */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <FilterBar>
          <SelectFilter label="Segment" value={segmentFilter} options={segments} onChange={setSegmentFilter} />
          <SelectFilter label="SLA Status" value={slaFilter} options={['On Time', 'Overdue', 'Pending']} onChange={setSlaFilter} />
        </FilterBar>
        <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => { setSelectedStore(null); setShowCommissionForm(true); }}>
          Commission Store
        </Button>
      </div>

      {/* Store Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(store => (
          <div
            key={store.id}
            className={`rounded-lg border p-4 space-y-3 ${
              store.slaStatus === 'Overdue' ? 'border-red-200 bg-red-50' :
              store.slaStatus === 'On Time' ? 'border-green-200 bg-green-50' :
              'border-slate-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">{store.storeId}</p>
                <p className="text-xs text-slate-500">{store.segment}</p>
              </div>
              <div className="flex gap-2">
                {slaBadge(store.slaStatus)}
                {store.commissioned && <Badge variant="success">Commissioned</Badge>}
              </div>
            </div>

            {/* GPS Card */}
            <div className="flex items-center gap-2 bg-white rounded-md border border-slate-200 px-3 py-2">
              <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
              <div>
                <p className="text-xs font-medium text-slate-700">{store.siteLocation}</p>
                <p className="text-xs text-slate-400 font-mono">{store.gpsCoords}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <p className="text-slate-500">Area</p>
                <p className="font-semibold text-slate-700">{store.areaSqm.toLocaleString()} mÂ²</p>
              </div>
              <div>
                <p className="text-slate-500">Award Date</p>
                <p className="font-semibold text-slate-700">{store.awardDate}</p>
              </div>
              <div>
                <p className="text-slate-500">Days from Award</p>
                <p className={`font-semibold ${store.daysFromAward > 15 ? 'text-red-700' : 'text-green-700'}`}>
                  {store.daysFromAward} days {store.daysFromAward > 15 ? '(Overdue)' : '(On Time)'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Fencing:</span>
                {boolBadge(store.fencing)}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Security:</span>
                {boolBadge(store.security)}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Material Shed:</span>
                {boolBadge(store.materialShed)}
              </div>
            </div>

            {store.setupDate && (
              <p className="text-xs text-slate-500">Setup Date: <span className="font-medium text-slate-700">{store.setupDate}</span></p>
            )}

            {!store.commissioned && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => { setSelectedStore(store); setShowCommissionForm(true); }}
              >
                Commission This Store
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Table View */}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead>
            <tr>
              <TH>Store ID</TH>
              <TH>Segment</TH>
              <TH>Site Location</TH>
              <TH>GPS Co-ords</TH>
              <TH>Area (mÂ²)</TH>
              <TH>Fencing</TH>
              <TH>Security</TH>
              <TH>Mat. Shed</TH>
              <TH>Setup Date</TH>
              <TH>Commissioned</TH>
              <TH>Days from Award</TH>
              <TH>SLA Status</TH>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {filtered.map(row => (
              <tr key={row.id} className={row.slaStatus === 'Overdue' ? 'bg-red-50' : ''}>
                <TD className="font-mono text-xs font-semibold text-indigo-700 whitespace-nowrap">{row.storeId}</TD>
                <TD className="text-slate-700 whitespace-nowrap">{row.segment}</TD>
                <TD className="text-slate-600 whitespace-nowrap">{row.siteLocation}</TD>
                <TD className="font-mono text-xs text-slate-500 whitespace-nowrap">{row.gpsCoords}</TD>
                <TD className="text-slate-600 whitespace-nowrap">{row.areaSqm.toLocaleString()}</TD>
                <TD>{boolBadge(row.fencing)}</TD>
                <TD>{boolBadge(row.security)}</TD>
                <TD>{boolBadge(row.materialShed)}</TD>
                <TD className="text-slate-500 whitespace-nowrap">{row.setupDate ?? '-'}</TD>
                <TD>{boolBadge(row.commissioned)}</TD>
                <TD className={`font-semibold whitespace-nowrap ${row.daysFromAward > 15 ? 'text-red-700' : 'text-green-700'}`}>
                  {row.daysFromAward}
                </TD>
                <TD>{slaBadge(row.slaStatus)}</TD>
                  {(canUpdate || canRemove) && (
                    <TD>
                      <div className="flex items-center gap-1">
                        {canUpdate && <button onClick={() => setEditRow(row)} className="p-1 text-slate-400 hover:text-indigo-600"><Pencil size={13}/></button>}
                        {canRemove && <button onClick={() => setDeleteRow(row)} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={13}/></button>}
                      </div>
                    </TD>
                  )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Commission Store Modal */}
      {showCommissionForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold text-slate-900 mb-1">
              {selectedStore ? `Commission ${selectedStore.storeId}` : 'Commission New Store'}
            </h2>
            <p className="text-xs text-slate-500 mb-4">BRD Â§4.8 â€” SLA: 15 days from award acceptance</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {['Store ID', 'Segment', 'Site Location', 'GPS Coordinates', 'Area (mÂ²)', 'Setup Date'].map(f => (
                <div key={f} className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-500">{f}</label>
                  <input
                    defaultValue={selectedStore ? ((selectedStore as unknown) as Record<string, string | number | boolean | undefined>)[
                      f === 'Store ID' ? 'storeId' :
                      f === 'GPS Coordinates' ? 'gpsCoords' :
                      f === 'Area (m\u00b2)' ? 'areaSqm' :
                      f === 'Setup Date' ? 'setupDate' :
                      f.toLowerCase().replace(/ /g, '')
                    ] as string ?? '' : ''}
                    className="border border-slate-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder={f}
                  />
                </div>
              ))}
              {['Fencing', 'Security Guard', 'Material Shed'].map(f => (
                <div key={f} className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-500">{f}</label>
                  <select className="border border-slate-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400">
                    <option>Yes</option><option>No</option>
                  </select>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowCommissionForm(false)}>Cancel</Button>
              <Button onClick={() => setShowCommissionForm(false)}>Commission Store</Button>
            </div>
          </div>
        </div>
      )}

      
    </div>
  );
};

// â”€â”€â”€ MAIN PAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const TABS = [
  { id: 'stock', label: 'Stock Register', count: STOCK_DATA.length },
  { id: 'jvr', label: 'JVR / GRN', count: GRN_DATA.length },
  { id: 'drum', label: 'Drum Tracking', count: DRUM_DATA.length },
  { id: 'bay', label: 'Bay Fabrication', count: BAY_DATA.length },
  { id: 'store', label: 'Store Setup', count: STORE_DATA.length },
];

const InventoryList: React.FC = () => {
  const navigate = useNavigate();
  const { canCreate, canUpdate, canRemove } = usePermission('4.15');
  const [stock, setStock] = usePersistentState<StockItem[]>('epc_inventory_stock', STOCK_DATA);
  const [grnData, setGrnData] = usePersistentState<GrnRecord[]>('epc_inventory_grn', GRN_DATA);
  const [drumData, setDrumData] = usePersistentState<DrumRecord[]>('epc_inventory_drums', DRUM_DATA);
  const [bayData, setBayData] = usePersistentState<BayRecord[]>('epc_inventory_bays', BAY_DATA);
  const [storeData, setStoreData] = usePersistentState<StoreRecord[]>('epc_inventory_store_setup', STORE_DATA);

  const [editRow, setEditRow] = useState<any>(null);
  const [deleteRow, setDeleteRow] = useState<any>(null);

  const confirmDelete = () => {
    if (!deleteRow) return;
    if (deleteRow.matCode) setStock(prev => prev.filter(s => s.matCode !== deleteRow.matCode));
    if (deleteRow.grnNo) setGrnData(prev => prev.filter(g => g.grnNo !== deleteRow.grnNo));
    if (deleteRow.serial) setDrumData(prev => prev.filter(d => d.serial !== deleteRow.serial));
    if (deleteRow.bayId) setBayData(prev => prev.filter(b => b.bayId !== deleteRow.bayId));
    if (deleteRow.storeId) setStoreData(prev => prev.filter(m => m.storeId !== deleteRow.storeId));
    setDeleteRow(null);
  };

  const handleSaveEdit = () => {
    if (!editRow) return;
    if (editRow.matCode) setStock(prev => prev.map(s => s.matCode === editRow.matCode ? { ...s, ...editRow } : s));
    if (editRow.grnNo) setGrnData(prev => prev.map(g => g.grnNo === editRow.grnNo ? { ...g, ...editRow } : g));
    if (editRow.serial) setDrumData(prev => prev.map(d => d.serial === editRow.serial ? { ...d, ...editRow } : d));
    if (editRow.bayId) setBayData(prev => prev.map(b => b.bayId === editRow.bayId ? { ...b, ...editRow } : b));
    if (editRow.storeId) setStoreData(prev => prev.map(m => m.storeId === editRow.storeId ? { ...m, ...editRow } : m));
    setEditRow(null);
  };

  const [activeTab, setActiveTab] = useState('stock');

  const tabsWithCounts = [
    { id: 'stock', label: 'Stock Register', count: stock.length },
    { id: 'jvr', label: 'JVR / GRN', count: grnData.length },
    { id: 'drum', label: 'Drum Tracking', count: drumData.length },
    { id: 'bay', label: 'Bay Fabrication', count: bayData.length },
    { id: 'store', label: 'Store Setup', count: storeData.length },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory & Warehouse"
        description="BRD Stage 4 — Store receipt (§4.7), JVR (§4.5/§4.7), OPGW drum tracking (§4.2), bay fabrication (§4.3), store setup milestone (§4.8)"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Inventory & Warehouse' },
        ]}
        action={
          <Button
            variant="outline"
            onClick={() => navigate('/inventory/dispatch')}
            className="flex items-center gap-1.5 text-xs font-semibold"
          >
            <Truck size={14} />
            Dispatch Planning & Transit →
          </Button>
        }
      />

      {/* Sub-Navigation Quick Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700 shrink-0 shadow-sm">
          <Package size={14} />
          Store & Stock Inventory
        </span>
        <Link
          to="/inventory/dispatch"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition-colors shrink-0 shadow-sm"
        >
          <Truck size={14} />
          Dispatch Planning & Transit
        </Link>
      </div>

      <Card>
        <div className="px-6 pt-4 pb-0">
          <Tabs tabs={tabsWithCounts} activeTab={activeTab} onChange={setActiveTab} />
        </div>
        <div className="p-6">
          {activeTab === 'stock' && <StockRegisterTab canUpdate={canUpdate} canRemove={canRemove} setEditRow={setEditRow} setDeleteRow={setDeleteRow} stock={stock} setStock={setStock} />}
          {activeTab === 'jvr' && <JvrGrnTab canUpdate={canUpdate} canRemove={canRemove} setEditRow={setEditRow} setDeleteRow={setDeleteRow} grnData={grnData} setGrnData={setGrnData} />}
          {activeTab === 'drum' && <DrumTrackingTab canUpdate={canUpdate} canRemove={canRemove} setEditRow={setEditRow} setDeleteRow={setDeleteRow} drumData={drumData} setDrumData={setDrumData} />}
          {activeTab === 'bay' && <BayFabricationTab canUpdate={canUpdate} canRemove={canRemove} setEditRow={setEditRow} setDeleteRow={setDeleteRow} bayData={bayData} setBayData={setBayData} />}
          {activeTab === 'store' && <StoreSetupTab canUpdate={canUpdate} canRemove={canRemove} setEditRow={setEditRow} setDeleteRow={setDeleteRow} storeData={storeData} setStoreData={setStoreData} />}
        </div>
      </Card>

      
    
      <ConfirmDeleteDialog open={!!deleteRow} recordName={deleteRow ? (deleteRow.id || deleteRow.matCode || 'item') : ''} recordType="record" onConfirm={confirmDelete} onCancel={() => setDeleteRow(null)} />
      {editRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Edit Record — {editRow.id || editRow.matCode}</h3>
              <button onClick={() => setEditRow(null)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
            </div>
            <div className="p-5 space-y-3">
              {editRow.desc !== undefined && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                  <input
                    value={editRow.desc || ''}
                    onChange={e => setEditRow({ ...editRow, desc: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              )}
              {editRow.material !== undefined && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Material</label>
                  <input
                    value={editRow.material || ''}
                    onChange={e => setEditRow({ ...editRow, material: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              )}
              {editRow.location !== undefined && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Location</label>
                  <input
                    value={editRow.location || ''}
                    onChange={e => setEditRow({ ...editRow, location: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              )}
              {editRow.qty !== undefined && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={editRow.qty || 0}
                    onChange={e => setEditRow({ ...editRow, qty: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              )}
              {editRow.status !== undefined && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
                  <input
                    value={editRow.status || ''}
                    onChange={e => setEditRow({ ...editRow, status: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              )}
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-200">
              <button onClick={() => setEditRow(null)} className="flex-1 px-4 py-2 text-sm text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={handleSaveEdit} className="flex-1 px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Save Changes</button>
            </div>
          </div>
        </div>
      )}
</div>
  );
};

export default InventoryList;
