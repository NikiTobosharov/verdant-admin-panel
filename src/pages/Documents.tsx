
import { useState } from 'react';
import { useData, Document } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO, isSameDay } from 'date-fns';

const Documents = () => {
  const { documents, addDocument } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(new Date());
  const [newDoc, setNewDoc] = useState<{
    name: string;
    deadline: string;
    importance: 'high' | 'medium' | 'low';
    additionalInfo: string;
  }>({
    name: '',
    deadline: '',
    importance: 'medium',
    additionalInfo: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addDocument(newDoc);
    setNewDoc({
      name: '',
      deadline: '',
      importance: 'medium',
      additionalInfo: '',
    });
    setIsDialogOpen(false);
  };

  // Calculate documents on selected day
  const documentsOnSelectedDay = selectedDay
    ? documents.filter(doc => isSameDay(parseISO(doc.deadline), selectedDay))
    : [];

  // Get all deadline dates for highlighting in the calendar
  const datesWithDeadlines = documents.map(doc => parseISO(doc.deadline));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Documents</h1>
          <p className="text-muted-foreground">Manage your documents and deadlines</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-admin-green hover:bg-admin-green-dark">
              Add New Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Document</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Document Name</Label>
                <Input
                  id="name"
                  placeholder="Enter document name"
                  value={newDoc.name}
                  onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={newDoc.deadline}
                  onChange={(e) => setNewDoc({ ...newDoc, deadline: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="importance">Importance</Label>
                <Select
                  value={newDoc.importance}
                  onValueChange={(value: 'high' | 'medium' | 'low') => 
                    setNewDoc({ ...newDoc, importance: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select importance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="additionalInfo">Additional Information</Label>
                <Textarea
                  id="additionalInfo"
                  placeholder="Enter any additional information about this document"
                  value={newDoc.additionalInfo}
                  onChange={(e) => setNewDoc({ ...newDoc, additionalInfo: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="pt-4 flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-admin-green hover:bg-admin-green-dark">
                  Create Document
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="pt-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="calendar" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-7 md:gap-6">
            <div className="md:col-span-3 order-2 md:order-1 mt-6 md:mt-0">
              <div className="space-y-4">
                <div className="text-xl font-semibold">
                  {selectedDay ? (
                    <span>Deadlines on {format(selectedDay, 'MMMM d, yyyy')}</span>
                  ) : (
                    <span>Select a date to view deadlines</span>
                  )}
                </div>
                
                {documentsOnSelectedDay.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-1">
                    {documentsOnSelectedDay.map((doc) => (
                      <DocumentCard key={doc.id} document={doc} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 bg-white rounded-lg border">
                    <p className="text-muted-foreground">No document deadlines for this date.</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="md:col-span-4 order-1 md:order-2">
              <Card>
                <CardContent className="pt-6">
                  <Calendar
                    mode="single"
                    selected={selectedDay}
                    onSelect={setSelectedDay}
                    className="pointer-events-auto"
                    components={{
                      DayContent: ({ date, ...props }) => {
                        const hasDeadline = datesWithDeadlines.some((deadlineDate) => 
                          isSameDay(date, deadlineDate)
                        );
                        
                        return (
                          <div 
                            className={cn(
                              "relative flex h-full w-full items-center justify-center",
                              hasDeadline && "bg-blue-100 rounded-full font-bold"
                            )}
                            {...props}
                          >
                            {date.getDate()}
                            {hasDeadline && <div className="w-1 h-1 bg-blue-500 absolute bottom-1 rounded-full"></div>}
                          </div>
                        );
                      },
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const DocumentCard = ({ document }: { document: Document }) => {
  const { name, deadline, importance, createdAt, additionalInfo } = document;
  
  // Calculate days remaining
  const today = new Date();
  const deadlineDate = new Date(deadline);
  const daysRemaining = Math.ceil(
    (deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card className="overflow-hidden">
      <div className={`h-2 ${
        importance === 'high' 
          ? 'bg-red-500' 
          : importance === 'medium' 
          ? 'bg-yellow-500' 
          : 'bg-blue-500'
      }`} />
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created</span>
            <span>{createdAt}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Deadline</span>
            <span>{deadline}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Days Remaining</span>
            <span className={`font-medium ${
              daysRemaining < 0 
                ? 'text-red-500' 
                : daysRemaining < 7 
                ? 'text-amber-500' 
                : 'text-green-600'
            }`}>
              {daysRemaining < 0 
                ? 'Overdue!' 
                : daysRemaining === 0 
                ? 'Due today!' 
                : `${daysRemaining} days`}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Importance</span>
            <span className={`status-${importance}`}>
              {importance.charAt(0).toUpperCase() + importance.slice(1)}
            </span>
          </div>
          {additionalInfo && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-muted-foreground text-xs mb-1">Additional Info:</p>
              <p className="text-sm">{additionalInfo}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Documents;
