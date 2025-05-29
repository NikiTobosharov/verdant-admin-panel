
import { useState } from 'react';
import { Document } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Trash2 } from 'lucide-react';

interface DocumentCardProps {
  document: Document;
  onUpdate: (documentId: string, documentData: Partial<Omit<Document, 'id' | 'createdAt'>>) => void;
  onDelete: (documentId: string) => void;
  documentNumber: number;
}

const DocumentCard = ({ document, onUpdate, onDelete, documentNumber }: DocumentCardProps) => {
  const { id, name, deadline, importance, createdAt, additionalInfo } = document;
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editDoc, setEditDoc] = useState({
    name,
    deadline,
    importance,
    additionalInfo: additionalInfo || '',
  });
  
  // Calculate days remaining
  const today = new Date();
  const deadlineDate = new Date(deadline);
  const daysRemaining = Math.ceil(
    (deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(id, editDoc);
    setIsEditDialogOpen(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      onDelete(id);
    }
  };

  return (
    <Card className="overflow-hidden relative">
      <div className="absolute top-2 right-2 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
        #{documentNumber}
      </div>
      <div className={`h-2 ${
        importance === 'high' 
          ? 'bg-red-500' 
          : importance === 'medium' 
          ? 'bg-yellow-500' 
          : 'bg-blue-500'
      }`} />
      <CardHeader className="pb-2">
        <CardTitle className="text-lg pr-12">{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created</span>
            <span>{createdAt}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ends</span>
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
          <div className="pt-2 flex justify-end space-x-2">
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Document</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleEditSubmit} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Document Name</Label>
                    <Input
                      id="edit-name"
                      value={editDoc.name}
                      onChange={(e) => setEditDoc({ ...editDoc, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-deadline">Deadline</Label>
                    <Input
                      id="edit-deadline"
                      type="date"
                      value={editDoc.deadline}
                      onChange={(e) => setEditDoc({ ...editDoc, deadline: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-importance">Importance</Label>
                    <Select
                      value={editDoc.importance}
                      onValueChange={(value: 'high' | 'medium' | 'low') => 
                        setEditDoc({ ...editDoc, importance: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-additionalInfo">Additional Information</Label>
                    <Textarea
                      id="edit-additionalInfo"
                      value={editDoc.additionalInfo}
                      onChange={(e) => setEditDoc({ ...editDoc, additionalInfo: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <div className="pt-4 flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-admin-green hover:bg-admin-green-dark">
                      Save Changes
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentCard;
