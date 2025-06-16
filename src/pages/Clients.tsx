import { useState } from 'react';
import { useData, Client } from '@/contexts/DataContext';
import { useAuth, getCookie } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

const Clients = () => {
  const { clients, updateClientStatus } = useData();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Assign permissions using backend endpoint (only for super admin)
  const assignPermissions = async (clientId: string, permissions: 'super admin' | 'moderator' | 'client') => {
    setLoadingId(clientId);
    try {
      const token = getCookie('jwtToken');
      if (!token) throw new Error('No token');
      let privilege: string;
      if (permissions === 'super admin') privilege = 'LEVEL_SUPER_ADMIN';
      else if (permissions === 'moderator') privilege = 'LEVEL_MODERATOR';
      else privilege = 'LEVEL_BASIC_USER';
      const res = await fetch('/app/permissions/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: Number(clientId), privilege }),
      });
      if (!res.ok) throw new Error('Failed to update permissions');
      window.location.reload();
    } catch (err) {
      alert('Could not update permissions');
    } finally {
      setLoadingId(null);
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-muted-foreground">Manage your client list</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search clients..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Status: {statusFilter === 'all' ? 'All' : statusFilter === 'active' ? 'Active' : 'Inactive'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                    All
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('active')}>
                    Active
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('inactive')}>
                    Inactive
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="rounded-md border overflow-hidden">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th className="hidden md:table-cell">Email</th>
                  <th className="hidden lg:table-cell">Phone</th>
                  <th className="hidden md:table-cell">Joined</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                  <th>Permissions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <ClientRow
                      key={client.id}
                      client={client}
                      onStatusChange={updateClientStatus}
                      onPermissionsChange={assignPermissions}
                      canChangePermissions={user?.role === 'super admin'}
                      loading={loadingId === client.id}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-muted-foreground">
                      No clients found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-sm text-muted-foreground text-right">
            Total: {filteredClients.length} clients
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ClientRow = ({
  client,
  onStatusChange,
  onPermissionsChange,
  canChangePermissions,
  loading
}: {
  client: Client & { privilege_level?: number };
  onStatusChange: (id: string, status: 'active' | 'inactive') => void;
  onPermissionsChange: (id: string, permissions: 'super admin' | 'moderator' | 'client') => void;
  canChangePermissions: boolean;
  loading?: boolean;
}) => {
  // Map privilege_level to text
  const getPermissionsText = (client: any) => {
    if (typeof client.privilege_level !== 'undefined') {
      if (client.privilege_level === 1) return 'super admin';
      if (client.privilege_level === 2) return 'moderator';
      if (client.privilege_level === 3) return 'client';
    }
    // fallback to permissions property if present
    if (client.permissions) return client.permissions;
    return 'client';
  };

  const permissionsText = getPermissionsText(client);

  const getPermissionsBadgeStyle = (permissions: string) => {
    switch (permissions) {
      case 'super admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'moderator':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'client':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <tr>
      <td>
        <div>
          <div className="font-medium">{client.name}</div>
        </div>
      </td>
      <td className="hidden md:table-cell">{client.email}</td>
      <td className="hidden lg:table-cell">{client.phone}</td>
      <td className="hidden md:table-cell">{format(new Date(client.joinedDate), 'MMM dd, yyyy')}</td>
      <td>
        <span className={`status-${client.status}`}>
          {client.status === 'active' ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => 
              onStatusChange(client.id, client.status === 'active' ? 'inactive' : 'active')
            }>
              Mark as {client.status === 'active' ? 'Inactive' : 'Active'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
      <td>
        {canChangePermissions ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <span className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer ${getPermissionsBadgeStyle(permissionsText)}`}>
                {permissionsText}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <DropdownMenuItem onClick={() => onPermissionsChange(client.id, 'super admin')}>
                Super Admin
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPermissionsChange(client.id, 'moderator')}>
                Moderator
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPermissionsChange(client.id, 'client')}>
                Client
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPermissionsBadgeStyle(permissionsText)} opacity-60`}>
            {permissionsText}
          </span>
        )}
      </td>
    </tr>
  );
};

export default Clients;
