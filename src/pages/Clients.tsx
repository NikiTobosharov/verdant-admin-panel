
import { useState } from 'react';
import { useData, Client } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

const Clients = () => {
  const { clients, updateClientStatus } = useData();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
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
                </tr>
              </thead>
              <tbody>
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <ClientRow 
                      key={client.id} 
                      client={client} 
                      onStatusChange={updateClientStatus} 
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-muted-foreground">
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
  onStatusChange 
}: { 
  client: Client; 
  onStatusChange: (id: string, status: 'active' | 'inactive') => void;
}) => {
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
    </tr>
  );
};

export default Clients;
