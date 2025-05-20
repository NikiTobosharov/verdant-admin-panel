
import React, { useState } from 'react';
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
import { UserCog, FilePen } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';

const Admin = () => {
  const { personalNotes, addPersonalNote, nickname, updateNickname } = useData();
  const { user } = useAuth();
  const [newNickname, setNewNickname] = useState(nickname);
  const [newNote, setNewNote] = useState({
    title: '',
    date: '',
    description: ''
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <UserCog className="h-4 w-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center gap-2">
            <FilePen className="h-4 w-4" /> Personal Notes
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
      </Tabs>
    </div>
  );
};

export default Admin;
