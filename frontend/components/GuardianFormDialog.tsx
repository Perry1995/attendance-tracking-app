'use client';

import { useState, useEffect } from 'react';
import { guardiansApi } from '@/lib/api/guardians';
import { usersApi } from '@/lib/api/users';
import { studentsApi } from '@/lib/api/students';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface GuardianFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  guardianId?: string;
  studentId?: string;
}

interface FormData {
  guardianId: string;
  studentId: string;
  relationship: string;
  isPrimary: boolean;
}

export function GuardianFormDialog({ 
  isOpen, 
  onClose, 
  onSuccess,
  guardianId,
  studentId,
}: GuardianFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardians, setGuardians] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [formData, setFormData] = useState<FormData>({
    guardianId: guardianId || '',
    studentId: studentId || '',
    relationship: 'parent',
    isPrimary: false,
  });

  useEffect(() => {
    if (isOpen) {
      fetchGuardians();
      fetchStudents();
      setFormData({
        guardianId: guardianId || '',
        studentId: studentId || '',
        relationship: 'parent',
        isPrimary: false,
      });
      setError(null);
    }
  }, [isOpen, guardianId, studentId]);

  const fetchGuardians = async () => {
    try {
      const response = await usersApi.getUsers({ role: 'guardian' });
      if (response.success) {
        setGuardians(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch guardians:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await studentsApi.getStudents();
      if (response.success) {
        setStudents(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.guardianId) {
      setError('Please select a guardian');
      return false;
    }
    if (!formData.studentId) {
      setError('Please select a student');
      return false;
    }
    if (!formData.relationship) {
      setError('Please select a relationship type');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const submitData = {
        guardianId: formData.guardianId,
        studentId: formData.studentId,
        relationship: formData.relationship,
        isPrimary: formData.isPrimary,
      };

      const response = await guardiansApi.createRelationship(submitData);
      if (response.success) {
        toast.success('Guardian relationship created successfully');
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (error: any) {
      console.error('Failed to create relationship:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create relationship';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        guardianId: guardianId || '',
        studentId: studentId || '',
        relationship: 'parent',
        isPrimary: false,
      });
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Link Guardian to Student
          </DialogTitle>
          <DialogDescription>
            Create a relationship between a guardian and a student
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="guardian">Guardian *</Label>
            <Select
              value={formData.guardianId}
              onValueChange={(value) => handleChange('guardianId', value)}
              disabled={isSubmitting || !!guardianId || guardians.length === 0}
            >
              <SelectTrigger id="guardian">
                <SelectValue placeholder="Select a guardian" />
              </SelectTrigger>
              <SelectContent>
                {guardians.map((guardian) => (
                  <SelectItem key={guardian.id} value={guardian.id}>
                    {guardian.firstName} {guardian.lastName} ({guardian.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {guardians.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No guardians found. Please create guardian users first.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="student">Student *</Label>
            <Select
              value={formData.studentId}
              onValueChange={(value) => handleChange('studentId', value)}
              disabled={isSubmitting || !!studentId || students.length === 0}
            >
              <SelectTrigger id="student">
                <SelectValue placeholder="Select a student" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.firstName} {student.lastName} (ID: {student.studentId})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {students.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No students found. Please create students first.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="relationship">Relationship *</Label>
            <Select
              value={formData.relationship}
              onValueChange={(value) => handleChange('relationship', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="relationship">
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="parent">Parent</SelectItem>
                <SelectItem value="father">Father</SelectItem>
                <SelectItem value="mother">Mother</SelectItem>
                <SelectItem value="guardian">Legal Guardian</SelectItem>
                <SelectItem value="grandparent">Grandparent</SelectItem>
                <SelectItem value="uncle">Uncle</SelectItem>
                <SelectItem value="aunt">Aunt</SelectItem>
                <SelectItem value="sibling">Sibling</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isPrimary"
              checked={formData.isPrimary}
              onCheckedChange={(checked) => handleChange('isPrimary', checked)}
              disabled={isSubmitting}
            />
            <Label
              htmlFor="isPrimary"
              className="text-sm font-normal cursor-pointer"
            >
              Set as primary guardian
            </Label>
          </div>
          <p className="text-xs text-muted-foreground ml-6">
            Primary guardians receive priority notifications
          </p>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || guardians.length === 0 || students.length === 0}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Relationship
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
