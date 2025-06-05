import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from "sonner";
import { useAuth } from './AuthContext';

// Types
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

type DataContextType = {
  documents: Document[];
  events: Event[];
  clients: Client[];
  groups: Group[];
  notifications: Notification[];
  personalNotes: PersonalNote[];
  nickname: string;
  addDocument: (doc: Omit<Document, 'id' | 'createdAt'>) => void;
  updateDocument: (documentId: string, documentData: Partial<Omit<Document, 'id' | 'createdAt'>>) => void;
  deleteDocument: (documentId: string) => void;
  addEvent: (event: Omit<Event, 'id' | 'sentToClients' | 'redacted'>) => void;
  updateEvent: (eventId: string, eventData: Partial<Omit<Event, 'id' | 'sentToClients' | 'redacted'>>) => void;
  sendEventToClients: (eventId: string, message: string) => void;
  sendCustomNotification: (title: string, message: string) => void;
  updateClientStatus: (clientId: string, status: 'active' | 'inactive') => void;
  updateClientPermissions: (clientId: string, permissions: 'super admin' | 'moderator' | 'client') => void;
  updateClientGroup: (clientId: string, groupId: string | undefined) => void;
  addGroup: (name: string) => void;
  updateGroup: (groupId: string, name: string) => void;
  deleteGroup: (groupId: string) => void;
  toggleEventRedaction: (eventId: string) => void;
  addPersonalNote: (note: Omit<PersonalNote, 'id' | 'createdAt'>) => void;
  updateNickname: (newNickname: string) => void;
};

// Mock data
const mockDocuments: Document[] = [
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

const mockEvents: Event[] = [
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



const mockNotifications: Notification[] = [
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

const mockPersonalNotes: PersonalNote[] = [
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

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [clients, setClients] = useState<Client[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [personalNotes, setPersonalNotes] = useState<PersonalNote[]>(mockPersonalNotes);
  const [nickname, setNickname] = useState<string>('Admin');

  const { user } = useAuth();
  const [token, setToken] = useState<string | null>(null);

  // Fetch JWT token from localStorage or AuthContext if available
  useEffect(() => {
    // Replace this logic with your actual JWT retrieval logic
    const jwt = localStorage.getItem('jwtToken');
    if (jwt) setToken(jwt);
  }, [user]);

  // Fetch groups from backend
  const fetchGroups = async () => {
    try {
      if (!token) return;
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`,
      };
      const res = await fetch('http://app:51821/groups', {
        headers,
      });
      if (!res.ok) throw new Error('Failed to fetch groups');
      const data = await res.json();
      setGroups(data);
    } catch (err) {
      toast.error('Could not fetch groups');
    }
  };

  // Fetch clients from backend
  const fetchClients = async () => {
    try {
      if (!token) return;
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`,
      };
      const res = await fetch('http://app:51821/my/users', {
        method: 'GET',
        headers,
      });
      if (!res.ok) throw new Error('Failed to fetch clients');
      const data = await res.json();
      // Map backend users to Client type, normalizing joinedDate
      const mappedClients: Client[] = data.map((user: any) => ({
        id: user.id?.toString() ?? '',
        name: user.name ?? '',
        email: user.email ?? '',
        phone: user.phone ?? '',
        status: user.status ?? 'active',
        permissions: user.privilege_level === 1
          ? 'super admin'
          : user.privilege_level === 2
            ? 'moderator'
            : 'client',
        joinedDate: user.join_date
          ? new Date(user.join_date).toISOString().split('T')[0]
          : user.joinedDate || user.created_at || user.createdAt || new Date().toISOString().split('T')[0],
        groupId: user.group_id ? user.group_id.toString() : undefined,
      }));
      setClients(mappedClients);
    } catch (err) {
      toast.error('Could not fetch clients');
    }
  };

  // Fetch clients and groups on mount or when token changes
  useEffect(() => {
    if (token) {
      fetchGroups();
      fetchClients();
    }
  }, [token]);

  const addDocument = (doc: Omit<Document, 'id' | 'createdAt'>) => {
    const newDoc = {
      ...doc,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setDocuments(prev => [newDoc, ...prev]);
    toast.success("Document added successfully");
  };

  const updateDocument = (documentId: string, documentData: Partial<Omit<Document, 'id' | 'createdAt'>>) => {
    setDocuments(prev => prev.map(document => 
      document.id === documentId ? { ...document, ...documentData } : document
    ));
    
    toast.success("Document updated successfully");
  };

  const deleteDocument = (documentId: string) => {
    setDocuments(prev => prev.filter(document => document.id !== documentId));
    toast.success("Document deleted successfully");
  };

  const addEvent = (event: Omit<Event, 'id' | 'sentToClients' | 'redacted'>) => {
    const newEvent = {
      ...event,
      id: crypto.randomUUID(),
      sentToClients: false,
      redacted: false
    };
    
    setEvents(prev => [newEvent, ...prev]);
    toast.success("Event added successfully");
  };

  const updateEvent = (eventId: string, eventData: Partial<Omit<Event, 'id' | 'sentToClients' | 'redacted'>>) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, ...eventData } : event
    ));
    
    toast.success("Event updated successfully");
  };

  const sendEventToClients = (eventId: string, message: string) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, sentToClients: true } : event
    ));
    
    const event = events.find(e => e.id === eventId);
    if (event) {
      const newNotification: Notification = {
        id: crypto.randomUUID(),
        title: event.title,
        message,
        sentAt: new Date().toISOString().split('T')[0],
        type: 'event',
        eventId
      };
      
      setNotifications(prev => [newNotification, ...prev]);
    }
    
    toast.success(`Event notification sent to ${clients.filter(c => c.status === 'active').length} active clients`);
  };

  const sendCustomNotification = (title: string, message: string) => {
    const newNotification: Notification = {
      id: crypto.randomUUID(),
      title,
      message,
      sentAt: new Date().toISOString().split('T')[0],
      type: 'custom'
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    toast.success(`Custom notification "${title}" sent to ${clients.filter(c => c.status === 'active').length} active clients`);
  };

  const updateClientStatus = (clientId: string, status: 'active' | 'inactive') => {
    setClients(prev => prev.map(client => 
      client.id === clientId ? { ...client, status } : client
    ));
    
    toast.success(`Client status updated to ${status}`);
  };

  const updateClientPermissions = (clientId: string, permissions: 'super admin' | 'moderator' | 'client') => {
    setClients(prev => prev.map(client => 
      client.id === clientId ? { ...client, permissions } : client
    ));
    
    toast.success(`Client permissions updated to ${permissions}`);
  };

  const updateClientGroup = async (clientId: string, groupId: string | undefined) => {
    try {
      if (!token) {
        toast.error("Not authenticated");
        return;
      }
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };
      // Ensure groupId is a number or null (not undefined or string)
      const body: Record<string, any> = { user_id: Number(clientId) };
      if (groupId !== undefined && groupId !== null) {
        body.group_id = Number(groupId);
      }
      const res = await fetch('http://app:51821/groups/assign', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to update client group');
      const updatedUser = await res.json();
      setClients(prev =>
        prev.map(client => client.id === clientId ? { ...client, groupId: updatedUser.group_id?.toString() } : client)
      );
      const groupName = groupId ? groups.find(g => g.id === groupId)?.name || 'Unknown' : 'No Group';
      toast.success(`Client group updated to ${groupName}`);
    } catch (err) {
      toast.error("Could not update client group");
    }
  };

  const addGroup = async (name: string) => {
    try {
      if (!token) {
        toast.error("Not authenticated");
        return;
      }
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };
      const res = await fetch('http://app:51821/groups', {
        method: 'POST',
        headers,
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error('Failed to add group');
      const newGroup = await res.json();
      setGroups(prev => [newGroup, ...prev]);
      toast.success("Group added successfully");
    } catch (err) {
      toast.error("Could not add group");
    }
  };

  const updateGroup = async (groupId: string, name: string) => {
    try {
      if (!token) {
        toast.error("Not authenticated");
        return;
      }
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };
      const res = await fetch(`http://app:51821/groups/${groupId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error('Failed to update group');
      const updatedGroup = await res.json();
      setGroups(prev =>
        prev.map(group => group.id === groupId ? updatedGroup : group)
      );
      toast.success("Group updated successfully");
    } catch (err) {
      toast.error("Could not update group");
    }
  };

  const deleteGroup = async (groupId: string) => {
    try {
      if (!token) {
        toast.error("Not authenticated");
        return;
      }
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`,
      };
      const res = await fetch(`http://app:51821/groups/${groupId}`, {
        method: 'DELETE',
        headers,
      });
      if (!res.ok) throw new Error('Failed to delete group');
      // Remove group from clients first
      setClients(prev => prev.map(client =>
        client.groupId === groupId ? { ...client, groupId: undefined } : client
      ));
      setGroups(prev => prev.filter(group => group.id !== groupId));
      toast.success("Group deleted successfully");
    } catch (err) {
      toast.error("Could not delete group");
    }
  };

  const toggleEventRedaction = (eventId: string) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, redacted: !event.redacted } : event
    ));
    
    const event = events.find(e => e.id === eventId);
    const newState = !event?.redacted;
    toast.success(`Event ${newState ? 'redacted' : 'unredacted'} successfully`);
  };

  const addPersonalNote = (note: Omit<PersonalNote, 'id' | 'createdAt'>) => {
    const newNote = {
      ...note,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setPersonalNotes(prev => [newNote, ...prev]);
    toast.success("Personal note added successfully");
  };

  const updateNickname = (newNickname: string) => {
    setNickname(newNickname);
    toast.success("Nickname updated successfully");
  };

  return (
    <DataContext.Provider value={{
      documents,
      events,
      clients,
      groups,
      notifications,
      personalNotes,
      nickname,
      addDocument,
      updateDocument,
      deleteDocument,
      addEvent,
      updateEvent,
      sendEventToClients,
      sendCustomNotification,
      updateClientStatus,
      updateClientPermissions,
      updateClientGroup,
      addGroup,
      updateGroup,
      deleteGroup,
      toggleEventRedaction,
      addPersonalNote,
      updateNickname,
      // Optionally expose refreshGroups for manual refresh
      refreshGroups: fetchGroups,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
