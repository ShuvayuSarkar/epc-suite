export enum ProjectStage {
  TENDERING = 'TENDERING',
  PLANNING = 'PLANNING',
  EXECUTION = 'EXECUTION',
  COMMISSIONING = 'COMMISSIONING',
  HANDOVER = 'HANDOVER',
}

export enum ProjectTypeCode {
  TRANSMISSION_LINE = 'TRANSMISSION_LINE',
  SUBSTATION = 'SUBSTATION',
  SOLAR = 'SOLAR',
  WIND = 'WIND',
}

export enum AwardDocumentType {
  LOA = 'LOA',
  PO = 'PO',
  CONTRACT = 'CONTRACT',
}

export enum BaselineType {
  INITIAL = 'INITIAL',
  REVISED = 'REVISED',
}

export enum MilestoneStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  DELAYED = 'DELAYED',
}

export enum DocumentType {
  DRAWING = 'DRAWING',
  SPECIFICATION = 'SPECIFICATION',
  MANUAL = 'MANUAL',
}

export enum DocumentStatus {
  DRAFT = 'DRAFT',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export type RAGStatus = 'RED' | 'AMBER' | 'GREEN';

export interface Project {
  id: string;
  name: string;
  code: string;
  stage: ProjectStage;
  type: ProjectTypeCode;
  ragStatus: RAGStatus;
}

export interface Client {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
}

export interface POLineItem {
  id: string;
  poNumber: string;
  itemDescription: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface WBS {
  id: string;
  projectId: string;
  code: string;
  name: string;
  parentWbsId?: string;
}

export interface Baseline {
  id: string;
  projectId: string;
  type: BaselineType;
  version: string;
  approvedDate: string;
}
