
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from "sonner";
import { useAuth } from './AuthContext';
import { Document, Event, Client, Group, Notification, PersonalNote } from '@/types';
import { mockDocuments, mockEvents, mockNotifications, mockPersonalNotes } from '@/data/mockData';
import { fetchGroups, fetchClients, updateClientGroupApi, addGroupApi, updateGroupApi, deleteGroupApi } from '@/services/apiService';

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
  refreshGroups: () => void;
};

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

  // Fetch groups from backend
  const loadGroups = async () => {
    const groupsData = await fetchGroups();
    setGroups(groupsData);
  };

  // Fetch clients from backend
  const loadClients = async () => {
    const clientsData = await fetchClients();
    setClients(clientsData);
  };

  // Fetch clients and groups on mount or when user changes
  useEffect(() => {
    loadGroups();
    loadClients();
  }, [user]);

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
      const updatedUser = await updateClientGroupApi(clientId, groupId);
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
      const newGroup = await addGroupApi(name);
      setGroups(prev => [newGroup, ...prev]);
      toast.success("Group added successfully");
    } catch (err) {
      toast.error("Could not add group");
    }
  };

  const updateGroup = async (groupId: string, name: string) => {
    try {
      const updatedGroup = await updateGroupApi(groupId, name);
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
      await deleteGroupApi(groupId);
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
      refreshGroups: loadGroups,
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
