
export type Document = {
  id: string;
  name: string;
  deadline: string;
  importance: 'high' | 'medium' | 'low';
  createdAt: string;
  additionalInfo?: string;
};

export type Event = {
  id: string;
  title: string;
  date: string;
  description: string;
  sentToClients: boolean;
  redacted: boolean;
};

export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  permissions: 'super admin' | 'moderator' | 'client';
  joinedDate: string;
  groupId?: string;
};

export type Group = {
  id: string;
  name: string;
  createdAt: string;
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  sentAt: string;
  type: 'event' | 'custom';
  eventId?: string;
};

export type PersonalNote = {
  id: string;
  title: string;
  date?: string;
  description: string;
  createdAt: string;
};
