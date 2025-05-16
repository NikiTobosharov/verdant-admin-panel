import { useState } from 'react';
import { useData, Event } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import EventCard from '@/components/events/EventCard';

const Events = () => {
  const { events, addEvent, toggleEventRedaction } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [date, setDate] = useState<Date>();
  const [newEvent, setNewEvent] = useState<{
    title: string;
    date: string;
    description: string;
  }>({
    title: '',
    date: '',
    description: '',
  });

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      setNewEvent({
        ...newEvent,
        date: format(selectedDate, 'yyyy-MM-dd'),
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addEvent(newEvent);
    setNewEvent({
      title: '',
      date: '',
      description: '',
    });
    setDate(undefined);
    setIsDialogOpen(false);
  };

  // Sort events by date
  const sortedEvents = [...events].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  // Group events by month
  const groupedEvents: Record<string, Event[]> = {};
  sortedEvents.forEach(event => {
    const monthYear = format(new Date(event.date), 'MMMM yyyy');
    if (!groupedEvents[monthYear]) {
      groupedEvents[monthYear] = [];
    }
    groupedEvents[monthYear].push(event);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-muted-foreground">Manage scheduled events and notifications</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-admin-green hover:bg-admin-green-dark">
              Add New Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  placeholder="Enter event title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Event Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={handleDateSelect}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Event Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter event description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  required
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
                  Create Event
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
        
        <TabsContent value="list" className="space-y-6 pt-4">
          {Object.keys(groupedEvents).length > 0 ? (
            Object.entries(groupedEvents).map(([monthYear, monthEvents]) => (
              <div key={monthYear} className="space-y-4">
                <h3 className="text-xl font-semibold">{monthYear}</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {monthEvents.map((event) => (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      onToggleRedaction={toggleEventRedaction}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-8">
              <p className="text-muted-foreground">No events scheduled yet.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="calendar" className="pt-4">
          <div className="admin-card">
            <div className="text-center p-8 text-gray-500">
              Calendar view will be implemented soon.
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Events;
