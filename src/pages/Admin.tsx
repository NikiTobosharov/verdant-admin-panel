import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { UserCog, FilePen, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Admin = () => {
  const { personalNotes, addPersonalNote, nickname, updateNickname, clients, groups, updateClientGroup, addGroup, updateGroup, deleteGroup } = useData();
  const { user } = useAuth();
  const [newNickname, setNewNickname] = useState(nickname);
  const [newNote, setNewNote] = useState({
    title: '',
    date: '',
    description: ''
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<{ id: string; name: string } | null>(null);
  const [groupNameCache, setGroupNameCache] = useState<Record<string, string>>({});

  const handleNicknameUpdate = () => {
    if (newNickname.trim()) {
      updateNickname(newNickname.trim());
    }
  };

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNote.title.trim() && newNote.description.trim()) {
      addPersonalNote(newNote);
      setNewNote({ title: '', date: '', description: '' });
      setIsDialogOpen(false);
    }
  };

  const handleAddGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGroupName.trim()) {
      addGroup(newGroupName.trim());
      setNewGroupName('');
      setIsGroupDialogOpen(false);
    }
  };

  const handleEditGroup = (group: { id: string; name: string }) => {
    setEditingGroup(group);
    setNewGroupName(group.name);
    setIsGroupDialogOpen(true);
  };

  const handleUpdateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGroup && newGroupName.trim()) {
      updateGroup(editingGroup.id, newGroupName.trim());
      setEditingGroup(null);
      setNewGroupName('');
      setIsGroupDialogOpen(false);
    }
  };

  const handleDeleteGroup = (groupId: string) => {
    deleteGroup(groupId);
  };

  const fetchAndCacheGroupName = async (groupId: string) => {
    if (!groupId || groupNameCache[groupId]) return;
    try {
      const localGroup = groups.find(g => g.id === groupId);
      if (localGroup) {
        setGroupNameCache(prev => ({ ...prev, [groupId]: localGroup.name }));
        return;
      }
      const token = localStorage.getItem('jwtToken');
      if (!token) return;
      const res = await fetch(`/app/groups`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const groupList = await res.json();
        const found = groupList.find((g: any) => g.id?.toString() === groupId);
        if (found && found.name) {
          setGroupNameCache(prev => ({ ...prev, [groupId]: found.name }));
          return;
        }
      }
      setGroupNameCache(prev => ({ ...prev, [groupId]: 'Unknown Group' }));
    } catch {
      setGroupNameCache(prev => ({ ...prev, [groupId]: 'Unknown Group' }));
    }
  };

  // Updated getGroupName to use cache and trigger fetch if needed
  const getGroupName = (groupId?: string) => {
    if (!groupId) return 'No Group';
    if (groupNameCache[groupId]) return groupNameCache[groupId];
    const localGroup = groups.find(g => g.id === groupId);
    if (localGroup) return localGroup.name;
    fetchAndCacheGroupName(groupId);
    return 'Loading...';
  };

  // Helper to get the groupId for Select value, always as string or 'none'
  const getClientGroupIdValue = (client: any) => {
    if (!client.groupId) return 'none';
    return client.groupId.toString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <UserCog className="h-4 w-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center gap-2">
            <FilePen className="h-4 w-4" /> Personal Notes
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Users className="h-4 w-4" /> Groups
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Manage your personal profile settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Username</p>
                      <p className="text-sm text-muted-foreground">{user?.username}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">Cannot be changed</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Role</p>
                      <p className="text-sm text-muted-foreground">{user?.role}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">System assigned</span>
                  </div>
                </div>
                
                <div className="space-y-2 pt-4">
                  <Label htmlFor="nickname">Display Nickname</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="nickname" 
                      value={newNickname} 
                      onChange={(e) => setNewNickname(e.target.value)}
                      placeholder="Enter your preferred display name"
                    />
                    <Button onClick={handleNicknameUpdate}>Update</Button>
                  </div>
                  <p className="text-sm text-muted-foreground">This is how you'll appear in the system</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Personal Notes</CardTitle>
                <CardDescription>
                  Keep track of your personal notes and reminders
                </CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Add Note</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add a Personal Note</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleNoteSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={newNote.title}
                        onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                        placeholder="Enter note title"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Date (Optional)</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newNote.date}
                        onChange={(e) => setNewNote({ ...newNote, date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newNote.description}
                        onChange={(e) => setNewNote({ ...newNote, description: e.target.value })}
                        placeholder="Enter note details"
                        rows={4}
                        required
                      />
                    </div>
                    <div className="flex justify-end space-x-2 pt-2">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Save Note</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {personalNotes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No personal notes yet. Click "Add Note" to create one.
                  </div>
                ) : (
                  personalNotes.map((note) => (
                    <Card key={note.id} className="bg-muted/50">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{note.title}</CardTitle>
                          <div className="flex flex-col text-right text-xs text-muted-foreground">
                            <span>Created: {format(new Date(note.createdAt), 'MMM d, yyyy')}</span>
                            {note.date && <span>For: {format(new Date(note.date), 'MMM d, yyyy')}</span>}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="whitespace-pre-line">{note.description}</p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Client Groups</CardTitle>
                <CardDescription>
                  Manage client groups and assign clients to groups
                </CardDescription>
              </div>
              <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setEditingGroup(null); setNewGroupName(''); }}>
                    Add Group
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingGroup ? 'Edit Group' : 'Add New Group'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={editingGroup ? handleUpdateGroup : handleAddGroup} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="groupName">Group Name</Label>
                      <Input
                        id="groupName"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder="Enter group name"
                        required
                      />
                    </div>
                    <div className="flex justify-end space-x-2 pt-2">
                      <Button type="button" variant="outline" onClick={() => setIsGroupDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">{editingGroup ? 'Update' : 'Add'} Group</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Available Groups</h3>
                  <div className="grid gap-2">
                    {groups.map((group) => {
                      // Fix: groupId may be string or number, always compare as string
                      const clientCount = clients.filter(
                        c => c.groupId && c.groupId.toString() === group.id.toString()
                      ).length;
                      return (
                        <div key={group.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <span className="font-medium">{group.name}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              ({clientCount} {clientCount === 1 ? 'client' : 'clients'})
                            </span>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">Actions</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handleEditGroup(group)}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteGroup(group.id)}
                                className="text-destructive"
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Client Group Assignments</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client Name</TableHead>
                        <TableHead>Current Group</TableHead>
                        <TableHead>Change Group</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clients.map((client) => (
                        <TableRow key={client.id}>
                          <TableCell className="font-medium">{client.name}</TableCell>
                          <TableCell>
                            <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                              {getGroupName(client.groupId)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={getClientGroupIdValue(client)}
                              onValueChange={(value) => 
                                updateClientGroup(client.id, value === 'none' ? undefined : value)
                              }
                            >
                              <SelectTrigger className="w-48">
                                <SelectValue>
                                  {getGroupName(client.groupId)}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">No Group</SelectItem>
                                {groups.map((group) => (
                                  <SelectItem key={group.id} value={group.id}>
                                    {group.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
