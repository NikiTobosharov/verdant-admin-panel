
import { format } from 'date-fns';
import { Event } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';

interface EventCardProps {
  event: Event;
  onToggleRedaction: (id: string) => void;
}

const EventCard = ({ event, onToggleRedaction }: EventCardProps) => {
  const { title, date, description, sentToClients, id, redacted } = event;
  
  return (
    <Card className={`overflow-hidden ${redacted ? 'bg-gray-100' : ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          <span className={redacted ? 'line-through text-gray-500' : ''}>
            {title}
          </span>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onToggleRedaction(id)} 
            title={redacted ? "Unredact" : "Redact"}
          >
            {redacted ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date</span>
            <span className={redacted ? 'text-gray-500' : ''}>
              {format(new Date(date), 'MMMM dd, yyyy')}
            </span>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Description</p>
            <p className={`text-sm ${redacted ? 'text-gray-500' : ''}`}>
              {redacted ? '[Content redacted]' : description}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t bg-muted/20 flex justify-between items-center">
        <div className="text-xs">
          {sentToClients ? (
            <span className={redacted ? 'text-gray-500' : 'text-admin-green'}>
              {redacted ? 'Notification status hidden' : 'Notification sent'}
            </span>
          ) : (
            <span className="text-gray-500">
              {redacted ? 'Notification status hidden' : 'Not sent to clients'}
            </span>
          )}
        </div>
        <Button
          size="sm"
          variant={sentToClients ? "outline" : "default"}
          className={sentToClients ? "" : "bg-admin-green hover:bg-admin-green-dark"}
          asChild
          disabled={redacted}
        >
          <a href={`/dashboard/messaging?event=${id}`}>
            {sentToClients ? "Send Again" : "Send to Clients"}
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
