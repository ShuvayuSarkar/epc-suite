export type TransmittalPurpose = 'For Review' | 'For Approval' | 'For Information' | 'For Construction' | 'As Built' | 'For Fabrication' | 'For Comment';
export type TransmittalStatus = 'draft' | 'sent' | 'acknowledged' | 'responded';

export interface TransmittalDocument {
  id: string;
  docNo: string;
  title: string;
  revision: string;
  copies: number;
  format: 'PDF' | 'DWG' | 'DOCX' | 'XLS' | 'Other';
}

export interface Transmittal {
  id: string;
  transmittalNo: string;
  project: string;
  date: string;
  from: string;
  to: string;
  toCompany: string;
  purpose: TransmittalPurpose;
  documents: TransmittalDocument[];
  remarks: string;
  status: TransmittalStatus;
  sentAt?: string;
  acknowledgedAt?: string;
  expectedResponseDate?: string;
  responseDate?: string;
  responseRemarks?: string;
}
