import { Attachment } from './attachment';

export type MeetingType = 'Kick-off' | 'Technical Review' | 'Client Review' | 'Safety' | 'Progress Review' | 'Site Coordination' | 'Other';
export type MeetingStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface MeetingParticipant {
  id: string;
  name: string;
  role: 'chair' | 'recorder' | 'attendee' | 'external';
  company: string;
  accepted: boolean;
}

export interface ActionItem {
  id: string;
  agendaItemId: string;
  description: string;
  owner: string;
  dueDate: string;
  status: 'open' | 'in_progress' | 'closed';
  closedAt?: string;
  remarks?: string;
}

export interface AgendaItem {
  id: string;
  number: string;
  topic: string;
  discussion: string;
  actionItems: ActionItem[];
}

export interface Meeting {
  id: string;
  meetingNo: string;
  title: string;
  type: MeetingType;
  project: string;
  date: string;
  time: string;
  venue: string;
  chairperson: string;
  recorder: string;
  participants: MeetingParticipant[];
  agenda: AgendaItem[];
  status: MeetingStatus;
  publishedAt?: string;
  attachments: Attachment[];
  notes: string;
}
