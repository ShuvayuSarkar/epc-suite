export type DeliverableCategory = 'Engineering' | 'Procurement' | 'Construction';
export type DeliverableStatus = 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'overdue';

export interface DeliverableMilestone {
  id: string;
  name: string;
  shortCode: string;          // e.g. "IFR", "IFA", "IFC"
  plannedDate: string;
  actualDate?: string;
  forecastDate?: string;
  weight: number;             // % contribution to deliverable progress (all must sum to 100)
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
}

export interface Deliverable {
  id: string;
  code: string;               // e.g. ENG-ELE-001
  title: string;
  category: DeliverableCategory;
  discipline: string;
  docType: string;
  wbsCode: string;
  assignedTo: string;
  plannedHours: number;
  actualHours: number;
  milestones: DeliverableMilestone[];
  plannedProgress: number;    // Computed from milestones
  actualProgress: number;     // Computed from completed milestones
  forecastProgress: number;
  weight: number;             // % weight in overall project progress
  status: DeliverableStatus;
  project: string;
  documentId?: string;
  notes: string;
  // For Construction deliverables
  plannedQty?: number;
  actualQty?: number;
  forecastQty?: number;
  unit?: string;
}

export interface SCurveDataPoint {
  period: string;             // "Oct'26", "Nov'26" etc.
  planned: number;            // cumulative planned %
  actual: number;             // cumulative actual %
  forecast: number;           // cumulative forecast %
}
