
import { Document, Event, Notification, PersonalNote } from '@/types';

export const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Annual Report',
    deadline: '2025-06-30',
    importance: 'high',
    createdAt: '2025-05-01',
    additionalInfo: 'Contains financial projections for the next fiscal year.'
  },
  {
    id: '2',
    name: 'Marketing Plan',
    deadline: '2025-06-15',
    importance: 'medium',
    createdAt: '2025-05-05',
    additionalInfo: 'Focus on digital marketing strategies.'
  },
  {
    id: '3',
    name: 'Budget Review',
    deadline: '2025-05-25',
    importance: 'high',
    createdAt: '2025-05-10'
  },
];

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Product Launch',
    date: '2025-06-15',
    description: 'Launching our new product line',
    sentToClients: false,
    redacted: false
  },
  {
    id: '2',
    title: 'Quarterly Meeting',
    date: '2025-05-30',
    description: 'Review Q2 performance',
    sentToClients: true,
    redacted: false
  },
  {
    id: '3',
    title: 'Team Building',
    date: '2025-07-10',
    description: 'Annual team building event',
    sentToClients: false,
    redacted: false
  },
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Product Launch',
    message: 'Dear Client,\n\nWe would like to inform you about our upcoming event: "Product Launch" scheduled for June 15, 2025.\n\nLaunching our new product line\n\nPlease let us know if you\'ll be able to attend.\n\nBest regards,\nAdmin Team',
    sentAt: '2025-05-15',
    type: 'event',
    eventId: '1'
  },
  {
    id: '2',
    title: 'Important Updates',
    message: 'Dear valued clients,\n\nWe have some important updates regarding our service hours during the upcoming holiday season.\n\nPlease check our website for details.\n\nBest regards,\nAdmin Team',
    sentAt: '2025-05-10',
    type: 'custom'
  }
];

export const mockPersonalNotes: PersonalNote[] = [
  {
    id: '1',
    title: 'Project Ideas',
    date: '2025-06-01',
    description: 'Brainstorm new project ideas for Q3',
    createdAt: '2025-05-15'
  },
  {
    id: '2',
    title: 'Client Meeting Notes',
    date: '2025-05-25',
    description: 'Notes from the meeting with Acme Corp. Discussed new requirements.',
    createdAt: '2025-05-10'
  }
];
