
import { toast } from "sonner";
import { getCookie } from '@/contexts/AuthContext';
import { Client, Group } from '@/types';

export const fetchGroups = async (): Promise<Group[]> => {
  try {
    const token = getCookie('jwtToken');
    if (!token) return [];
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
    };
    const res = await fetch('/app/groups', {
      headers,
    });
    if (!res.ok) throw new Error('Failed to fetch groups');
    const data = await res.json();
    return data;
  } catch (err) {
    toast.error('Could not fetch groups');
    return [];
  }
};

export const fetchClients = async (): Promise<Client[]> => {
  try {
    const token = getCookie('jwtToken');
    if (!token) return [];
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
    };
    const res = await fetch('/app/my/users', {
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
    return mappedClients;
  } catch (err) {
    toast.error('Could not fetch clients');
    return [];
  }
};

export const updateClientGroupApi = async (clientId: string, groupId: string | undefined) => {
  const token = getCookie('jwtToken');
  if (!token) {
    throw new Error("Not authenticated");
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
  const res = await fetch('/app/groups/assign', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to update client group');
  return await res.json();
};

export const addGroupApi = async (name: string) => {
  const token = getCookie('jwtToken');
  if (!token) {
    throw new Error("Not authenticated");
  }
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
  const res = await fetch('/app/groups', {
    method: 'POST',
    headers,
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error('Failed to add group');
  return await res.json();
};

export const updateGroupApi = async (groupId: string, name: string) => {
  const token = getCookie('jwtToken');
  if (!token) {
    throw new Error("Not authenticated");
  }
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
  const res = await fetch(`/app/groups/${groupId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error('Failed to update group');
  return await res.json();
};

export const deleteGroupApi = async (groupId: string) => {
  const token = getCookie('jwtToken');
  if (!token) {
    throw new Error("Not authenticated");
  }
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`,
  };
  const res = await fetch(`/app/groups/${groupId}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) throw new Error('Failed to delete group');
};
