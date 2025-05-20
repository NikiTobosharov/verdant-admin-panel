
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
import { format, parseISO, isSameDay } from 'date-fns';
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

  // For calendar view
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(new Date());

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

  // Get events for the selected day
  const eventsOnSelectedDay = selectedDay
    ? events.filter(event => isSameDay(parseISO(event.date), selectedDay))
    : [];

  // Create array of dates with events for highlighting in the calendar
  const datesWithEvents = events.map(event => parseISO(event.date));

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
          <div className="grid grid-cols-1 md:grid-cols-7 md:gap-6">
            <div className="md:col-span-3 order-2 md:order-1 mt-6 md:mt-0">
              <div className="space-y-4">
                <div className="text-xl font-semibold">
                  {selectedDay ? (
                    <span>Events on {format(selectedDay, 'MMMM d, yyyy')}</span>
                  ) : (
                    <span>Select a date to view events</span>
                  )}
                </div>
                
                {eventsOnSelectedDay.length > 0 ? (
                  <div className="space-y-4">
                    {eventsOnSelectedDay.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onToggleRedaction={toggleEventRedaction}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 bg-white rounded-lg border">
                    <p className="text-muted-foreground">No events scheduled for this date.</p>
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
                    modifiers={{
                      hasEvent: datesWithEvents,
                    }}
                    modifiersStyles={{
                      hasEvent: {
                        fontWeight: 'bold',
                        backgroundColor: '#e6f7e6',
                      }
                    }}
                    components={{
                      DayContent: ({ date, ...props }) => {
                        const hasEvent = datesWithEvents.some((eventDate) => 
                          isSameDay(date, eventDate)
                        );
                        return (
                          <div 
                            className={cn(
                              "relative flex h-full w-full items-center justify-center",
                              hasEvent && "bg-admin-green/10 rounded-full font-bold"
                            )}
                            {...props}
                          >
                            {date.getDate()}
                            {hasEvent && <div className="w-1 h-1 bg-admin-green absolute bottom-1 rounded-full"></div>}
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

export default Events;
