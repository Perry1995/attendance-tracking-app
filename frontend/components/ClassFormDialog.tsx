'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { classesApi, Class } from '@/lib/api/classes';
import { institutionsApi } from '@/lib/api/institutions';
import { usersApi } from '@/lib/api/users';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, BookOpen, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ClassFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  classData?: Class | null;
}

interface FormData {
  name: string;
  section: string;
  gradeLevel: string;
  academicYear: string;
  description: string;
  institutionId: string;
  teacherId: string;
}

export function ClassFormDialog({ isOpen, onClose, onSuccess, classData }: ClassFormDialogProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    section: '',
    gradeLevel: '',
    academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
    description: '',
    institutionId: '',
    teacherId: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchInstitutions();
      fetchTeachers();
      if (classData) {
        // Edit mode
        setFormData({
          name: classData.name || '',
          section: classData.section || '',
          gradeLevel: classData.gradeLevel || '',
          academicYear: classData.academicYear || '',
          description: classData.description || '',
          institutionId: classData.institutionId || '',
          teacherId: classData.teacherId || '',
        });
      } else {
        // Create mode
        setFormData({
          name: '',
          section: '',
          gradeLevel: '',
          academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
          description: '',
          institutionId: user?.roles?.[0]?.institutionId || '',
          teacherId: '',
        });
      }
      setError(null);
    }
  }, [isOpen, classData, user]);

  const fetchInstitutions = async () => {
    try {
      const response = await institutionsApi.getAll();
      if (response.success) {
        setInstitutions(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch institutions:', error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await usersApi.getUsers({ role: 'teacher' });
      if (response.success) {
        setTeachers(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Class name is required');
      return false;
    }
    if (!formData.academicYear.trim()) {
      setError('Academic year is required');
      return false;
    }
    if (!formData.institutionId) {
      setError('Institution is required');
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
      const submitData: any = {
        name: formData.name,
        section: formData.section || null,
        gradeLevel: formData.gradeLevel || null,
        academicYear: formData.academicYear,
        description: formData.description || null,
        institutionId: formData.institutionId,
        teacherId: formData.teacherId || null,
      };

      if (classData) {
        // Update existing class
        const response = await classesApi.update(classData.id, submitData);
        if (response.success) {
          toast.success('Class updated successfully');
          if (onSuccess) onSuccess();
          onClose();
        }
      } else {
        // Create new class
        const response = await classesApi.create(submitData);
        if (response.success) {
          toast.success('Class created successfully');
          if (onSuccess) onSuccess();
          onClose();
        }
      }
    } catch (error: any) {
      console.error('Failed to save class:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to save class';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        name: '',
        section: '',
        gradeLevel: '',
        academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
        description: '',
        institutionId: '',
        teacherId: '',
      });
      setError(null);
      onClose();
    }
  };

  const generateAcademicYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = -2; i <= 2; i++) {
      const year = currentYear + i;
      years.push(`${year}-${year + 1}`);
    }
    return years;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {classData ? 'Edit Class' : 'Create New Class'}
          </DialogTitle>
          <DialogDescription>
            {classData ? 'Update class information' : 'Create a new class for students'}
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
            <Label htmlFor="name">Class Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Mathematics 101"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="section">Section</Label>
              <Input
                id="section"
                value={formData.section}
                onChange={(e) => handleChange('section', e.target.value)}
                placeholder="e.g., A, B, C"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gradeLevel">Grade Level</Label>
              <Input
                id="gradeLevel"
                value={formData.gradeLevel}
                onChange={(e) => handleChange('gradeLevel', e.target.value)}
                placeholder="e.g., 10, 11, 12"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="academicYear">Academic Year *</Label>
            <Select
              value={formData.academicYear}
              onValueChange={(value) => handleChange('academicYear', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="academicYear">
                <SelectValue placeholder="Select academic year" />
              </SelectTrigger>
              <SelectContent>
                {generateAcademicYears().map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="institution">Institution *</Label>
            <Select
              value={formData.institutionId}
              onValueChange={(value) => handleChange('institutionId', value)}
              disabled={isSubmitting || institutions.length === 0}
            >
              <SelectTrigger id="institution">
                <SelectValue placeholder="Select institution" />
              </SelectTrigger>
              <SelectContent>
                {institutions.map((institution) => (
                  <SelectItem key={institution.id} value={institution.id}>
                    {institution.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="teacher">Assign Teacher</Label>
            <Select
              value={formData.teacherId}
              onValueChange={(value) => handleChange('teacherId', value)}
              disabled={isSubmitting || teachers.length === 0}
            >
              <SelectTrigger id="teacher">
                <SelectValue placeholder="Select teacher (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No teacher assigned</SelectItem>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.firstName} {teacher.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Add a brief description of this class..."
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {classData ? 'Update Class' : 'Create Class'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
