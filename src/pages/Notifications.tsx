
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { MessageSquareText, Bell } from 'lucide-react';

const Notifications = () => {
  const { events, clients, sendEventToClients, sendCustomNotification } = useData();
  const [searchParams] = useSearchParams();
  const eventIdFromUrl = searchParams.get('event');
  
  // Event notification states
  const [selectedEventId, setSelectedEventId] = useState<string>(eventIdFromUrl || '');
  const [eventMessageText, setEventMessageText] = useState<string>('');
  
  // Custom notification states
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customMessage, setCustomMessage] = useState<string>('');
  
  const [isSending, setIsSending] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>(eventIdFromUrl ? 'event' : 'custom');
  
  // Auto-populate message when event is selected
  useEffect(() => {
    if (selectedEventId) {
      const event = events.find(e => e.id === selectedEventId);
      if (event) {
        setEventMessageText(
          `Dear Client,\n\nWe would like to inform you about our upcoming event: "${event.title}" scheduled for ${format(new Date(event.date), 'MMMM dd, yyyy')}.\n\n${event.description}\n\nPlease let us know if you'll be able to attend.\n\nBest regards,\nAdmin Team`
        );
      }
    } else {
      setEventMessageText('');
    }
  }, [selectedEventId, events]);
  
  // Set event ID from URL if provided
  useEffect(() => {
    if (eventIdFromUrl) {
      setSelectedEventId(eventIdFromUrl);
      setActiveTab('event');
    }
  }, [eventIdFromUrl]);
  
  const handleSendEventNotification = () => {
    if (!selectedEventId || !eventMessageText.trim()) {
      return;
    }
    
    setIsSending(true);
    
    // Simulate API delay
    setTimeout(() => {
      sendEventToClients(selectedEventId, eventMessageText);
      setIsSending(false);
    }, 1000);
  };
  
  const handleSendCustomNotification = () => {
    if (!customTitle.trim() || !customMessage.trim()) {
      return;
    }
    
    setIsSending(true);
    
    // Simulate API delay
    setTimeout(() => {
      sendCustomNotification(customTitle, customMessage);
      setIsSending(false);
      // Clear form after sending
      setCustomTitle('');
      setCustomMessage('');
    }, 1000);
  };
  
  const activeClientsCount = clients.filter(c => c.status === 'active').length;
  const selectedEvent = events.find(e => e.id === selectedEventId);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Send Notifications</h1>
        <p className="text-muted-foreground">Notify clients about events or send custom messages</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="event" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span>Event Notification</span>
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center gap-2">
            <MessageSquareText className="h-4 w-4" />
            <span>Custom Notification</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="event" className="space-y-4">
          <div className="grid md:grid-cols-5 gap-6">
            <Card className="md:col-span-3">
              <CardContent className="pt-6">
                <form className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="event">Select Event</Label>
                    <Select
                      value={selectedEventId}
                      onValueChange={setSelectedEventId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an event" />
                      </SelectTrigger>
                      <SelectContent>
                        {events.map((event) => (
                          <SelectItem key={event.id} value={event.id}>
                            {event.title} ({format(new Date(event.date), 'MMM dd, yyyy')})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="eventMessage">Notification Message</Label>
                      {selectedEvent && (
                        <span className="text-xs text-muted-foreground">
                          Status: {selectedEvent.sentToClients ? 'Already sent' : 'Not sent'}
                        </span>
                      )}
                    </div>
                    <Textarea
                      id="eventMessage"
                      rows={10}
                      placeholder="Enter your notification message to clients"
                      value={eventMessageText}
                      onChange={(e) => setEventMessageText(e.target.value)}
                      className="resize-none"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      This notification will be sent to {activeClientsCount} active clients
                    </p>
                    
                    <Button
                      type="button"
                      className="bg-admin-green hover:bg-admin-green-dark"
                      disabled={!selectedEventId || !eventMessageText.trim() || isSending}
                      onClick={handleSendEventNotification}
                    >
                      {isSending ? 'Sending...' : 'Send Event Notification'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4">Tips for Effective Notifications</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex gap-2">
                    <div className="h-5 w-5 rounded-full bg-admin-green flex items-center justify-center text-white text-xs">
                      1
                    </div>
                    <p>Keep your notification clear and concise</p>
                  </li>
                  <li className="flex gap-2">
                    <div className="h-5 w-5 rounded-full bg-admin-green flex items-center justify-center text-white text-xs">
                      2
                    </div>
                    <p>Include all important event details</p>
                  </li>
                  <li className="flex gap-2">
                    <div className="h-5 w-5 rounded-full bg-admin-green flex items-center justify-center text-white text-xs">
                      3
                    </div>
                    <p>Specify any actions clients need to take</p>
                  </li>
                  <li className="flex gap-2">
                    <div className="h-5 w-5 rounded-full bg-admin-green flex items-center justify-center text-white text-xs">
                      4
                    </div>
                    <p>End with a clear call-to-action</p>
                  </li>
                </ul>
                
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium mb-2">Notification Preview</h4>
                  <div className="bg-gray-50 p-4 rounded-md text-sm max-h-[300px] overflow-y-auto">
                    {eventMessageText ? (
                      <div className="whitespace-pre-wrap">{eventMessageText}</div>
                    ) : (
                      <p className="text-muted-foreground">Select an event to see the notification preview</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="custom" className="space-y-4">
          <div className="grid md:grid-cols-5 gap-6">
            <Card className="md:col-span-3">
              <CardContent className="pt-6">
                <form className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="customTitle">Notification Title</Label>
                    <Input
                      id="customTitle"
                      placeholder="Enter notification title"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="customMessage">Notification Message</Label>
                    <Textarea
                      id="customMessage"
                      rows={10}
                      placeholder="Enter your custom notification message"
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      className="resize-none"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      This notification will be sent to {activeClientsCount} active clients
                    </p>
                    
                    <Button
                      type="button"
                      className="bg-admin-green hover:bg-admin-green-dark"
                      disabled={!customTitle.trim() || !customMessage.trim() || isSending}
                      onClick={handleSendCustomNotification}
                    >
                      {isSending ? 'Sending...' : 'Send Custom Notification'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4">Custom Notification Tips</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex gap-2">
                    <div className="h-5 w-5 rounded-full bg-admin-green flex items-center justify-center text-white text-xs">
                      1
                    </div>
                    <p>Use a descriptive title that catches attention</p>
                  </li>
                  <li className="flex gap-2">
                    <div className="h-5 w-5 rounded-full bg-admin-green flex items-center justify-center text-white text-xs">
                      2
                    </div>
                    <p>Keep your message focused on a single topic</p>
                  </li>
                  <li className="flex gap-2">
                    <div className="h-5 w-5 rounded-full bg-admin-green flex items-center justify-center text-white text-xs">
                      3
                    </div>
                    <p>Personalize content when possible</p>
                  </li>
                  <li className="flex gap-2">
                    <div className="h-5 w-5 rounded-full bg-admin-green flex items-center justify-center text-white text-xs">
                      4
                    </div>
                    <p>Include contact information for follow-up questions</p>
                  </li>
                </ul>
                
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium mb-2">Notification Preview</h4>
                  <div className="bg-gray-50 p-4 rounded-md text-sm max-h-[300px] overflow-y-auto">
                    {customTitle || customMessage ? (
                      <div>
                        {customTitle && (
                          <h5 className="font-medium mb-2">{customTitle}</h5>
                        )}
                        {customMessage && (
                          <div className="whitespace-pre-wrap">{customMessage}</div>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Enter a custom notification to see the preview</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Notifications;
