import React, { createContext, useState, useContext } from 'react';
import { toast } from "sonner";

// Types
export type Document = {
  id: string;
  name: string;
  deadline: string;
  importance: 'high' | 'medium' | 'low';
  createdAt: string;
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
  joinedDate: string;
};

type DataContextType = {
  documents: Document[];
  events: Event[];
  clients: Client[];
  addDocument: (doc: Omit<Document, 'id' | 'createdAt'>) => void;
  addEvent: (event: Omit<Event, 'id' | 'sentToClients' | 'redacted'>) => void;
  sendEventToClients: (eventId: string, message: string) => void;
  updateClientStatus: (clientId: string, status: 'active' | 'inactive') => void;
  toggleEventRedaction: (eventId: string) => void;
};

// Mock data
const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Annual Report',
    deadline: '2025-06-30',
    importance: 'high',
    createdAt: '2025-05-01'
  },
  {
    id: '2',
    name: 'Marketing Plan',
    deadline: '2025-06-15',
    importance: 'medium',
    createdAt: '2025-05-05'
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

const mockClients: Client[] = [
  {
    id: '1',
    name: 'Acme Corp',
    email: 'contact@acme.com',
    phone: '555-1234',
    status: 'active',
    joinedDate: '2024-01-15'
  },
  {
    id: '2',
    name: 'Widget Inc',
    email: 'info@widget.com',
    phone: '555-5678',
    status: 'active',
    joinedDate: '2024-02-20'
  },
  {
    id: '3',
    name: 'XYZ Industries',
    email: 'hello@xyz.com',
    phone: '555-9012',
    status: 'inactive',
    joinedDate: '2023-11-05'
  },
  {
    id: '4',
    name: 'Tech Solutions',
    email: 'support@techsolutions.com',
    phone: '555-3456',
    status: 'active',
    joinedDate: '2024-03-10'
  },
];

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [clients, setClients] = useState<Client[]>(mockClients);

  const addDocument = (doc: Omit<Document, 'id' | 'createdAt'>) => {
    const newDoc = {
      ...doc,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setDocuments(prev => [newDoc, ...prev]);
    toast.success("Document added successfully");
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

  const sendEventToClients = (eventId: string, message: string) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, sentToClients: true } : event
    ));
    
    toast.success(`Event notification sent to ${clients.filter(c => c.status === 'active').length} active clients`);
  };

  const updateClientStatus = (clientId: string, status: 'active' | 'inactive') => {
    setClients(prev => prev.map(client => 
      client.id === clientId ? { ...client, status } : client
    ));
    
    toast.success(`Client status updated to ${status}`);
  };

  const toggleEventRedaction = (eventId: string) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, redacted: !event.redacted } : event
    ));
    
    const event = events.find(e => e.id === eventId);
    const newState = !event?.redacted;
    toast.success(`Event ${newState ? 'redacted' : 'unredacted'} successfully`);
  };

  return (
    <DataContext.Provider value={{
      documents,
      events,
      clients,
      addDocument,
      addEvent,
      sendEventToClients,
      updateClientStatus,
      toggleEventRedaction
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
