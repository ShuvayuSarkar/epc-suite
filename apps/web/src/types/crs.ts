export type CommentType = 'Major' | 'Minor' | 'Info';
export type CommentStatus = 'open' | 'responded' | 'closed' | 'rejected';
export type CRSStatus = 'open' | 'partially_closed' | 'all_closed';
export type ReviewStage = 'Internal Review' | 'Client Review' | 'Vendor Review' | 'Third Party Review';

export interface CRSComment {
  id: string;
  number: string;
  page: string;
  commentBy: string;
  commentType: CommentType;
  commentText: string;
  response: string;
  responseBy: string;
  status: CommentStatus;
  dueDate: string;
  closedAt?: string;
}

export interface CRS {
  id: string;
  crsNo: string;
  documentId: string;
  documentNo: string;
  documentTitle: string;
  revision: string;
  reviewStage: ReviewStage;
  reviewedBy: string;
  comments: CRSComment[];
  status: CRSStatus;
  createdAt: string;
  project: string;
}
