
import { format } from 'date-fns';
import { useState } from 'react';
import { Event, useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Calendar, Edit, Save, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: Event;
  onToggleRedaction: (id: string) => void;
}

const EventCard = ({ event, onToggleRedaction }: EventCardProps) => {
  const { title, date, description, sentToClients, id, redacted } = event;
  const { updateEvent } = useData();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedDescription, setEditedDescription] = useState(description);
  const [editedDate, setEditedDate] = useState<Date>(new Date(date));
  
  const handleSave = () => {
    updateEvent(id, {
      title: editedTitle,
      description: editedDescription,
      date: format(editedDate, 'yyyy-MM-dd')
    });
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setEditedTitle(title);
    setEditedDescription(description);
    setEditedDate(new Date(date));
    setIsEditing(false);
  };
  
  return (
    <Card className={`overflow-hidden ${redacted ? 'bg-gray-100' : ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          {isEditing ? (
            <Input 
              value={editedTitle} 
              onChange={(e) => setEditedTitle(e.target.value)}
              className="flex-1 mr-2"
            />
          ) : (
            <span className={redacted ? 'line-through text-gray-500' : ''}>
              {title}
            </span>
          )}
          <div className="flex space-x-1">
            {isEditing ? (
              <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleSave} 
                  title="Save"
                >
                  <Save className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleCancel} 
                  title="Cancel"
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsEditing(true)} 
                  title="Edit"
                  disabled={redacted}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onToggleRedaction(id)} 
                  title={redacted ? "Unredact" : "Redact"}
                >
                  {redacted ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
              </>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date</span>
            {isEditing ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[140px] justify-start text-left font-normal",
                      !editedDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {editedDate ? format(editedDate, "MMM dd, yyyy") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <CalendarComponent
                    mode="single"
                    selected={editedDate}
                    onSelect={(date) => date && setEditedDate(date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            ) : (
              <span className={redacted ? 'text-gray-500' : ''}>
                {format(new Date(date), 'MMMM dd, yyyy')}
              </span>
            )}
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Description</p>
            {isEditing ? (
              <Textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="w-full"
              />
            ) : (
              <p className={`text-sm ${redacted ? 'text-gray-500' : ''}`}>
                {redacted ? '[Content redacted]' : description}
              </p>
            )}
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
