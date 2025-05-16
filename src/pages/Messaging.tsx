
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

const Messaging = () => {
  const { events, clients, sendEventToClients } = useData();
  const [searchParams] = useSearchParams();
  const eventIdFromUrl = searchParams.get('event');
  
  const [selectedEventId, setSelectedEventId] = useState<string>(eventIdFromUrl || '');
  const [messageText, setMessageText] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  
  // Auto-populate message when event is selected
  useEffect(() => {
    if (selectedEventId) {
      const event = events.find(e => e.id === selectedEventId);
      if (event) {
        setMessageText(
          `Dear Client,\n\nWe would like to inform you about our upcoming event: "${event.title}" scheduled for ${format(new Date(event.date), 'MMMM dd, yyyy')}.\n\n${event.description}\n\nPlease let us know if you'll be able to attend.\n\nBest regards,\nAdmin Team`
        );
      }
    } else {
      setMessageText('');
    }
  }, [selectedEventId, events]);
  
  // Set event ID from URL if provided
  useEffect(() => {
    if (eventIdFromUrl) {
      setSelectedEventId(eventIdFromUrl);
    }
  }, [eventIdFromUrl]);
  
  const handleSendMessage = () => {
    if (!selectedEventId || !messageText.trim()) {
      return;
    }
    
    setIsSending(true);
    
    // Simulate API delay
    setTimeout(() => {
      sendEventToClients(selectedEventId, messageText);
      setIsSending(false);
    }, 1000);
  };
  
  const activeClientsCount = clients.filter(c => c.status === 'active').length;
  const selectedEvent = events.find(e => e.id === selectedEventId);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Send Event Notifications</h1>
        <p className="text-muted-foreground">Notify clients about upcoming events</p>
      </div>
      
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
                  <Label htmlFor="message">Message</Label>
                  {selectedEvent && (
                    <span className="text-xs text-muted-foreground">
                      Status: {selectedEvent.sentToClients ? 'Already sent' : 'Not sent'}
                    </span>
                  )}
                </div>
                <Textarea
                  id="message"
                  rows={10}
                  placeholder="Enter your message to clients"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="resize-none"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  This message will be sent to {activeClientsCount} active clients
                </p>
                
                <Button
                  type="button"
                  className="bg-admin-green hover:bg-admin-green-dark"
                  disabled={!selectedEventId || !messageText.trim() || isSending}
                  onClick={handleSendMessage}
                >
                  {isSending ? 'Sending...' : 'Send Notification'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Tips for Effective Messages</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2">
                <div className="h-5 w-5 rounded-full bg-admin-green flex items-center justify-center text-white text-xs">
                  1
                </div>
                <p>Keep your message clear and concise</p>
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
              <h4 className="font-medium mb-2">Message Preview</h4>
              <div className="bg-gray-50 p-4 rounded-md text-sm max-h-[300px] overflow-y-auto">
                {messageText ? (
                  <div className="whitespace-pre-wrap">{messageText}</div>
                ) : (
                  <p className="text-muted-foreground">Select an event to see the message preview</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Messaging;
