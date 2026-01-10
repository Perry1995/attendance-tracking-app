'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { studentsApi, Student, CreateStudentData } from '@/lib/api/students';
import { institutionsApi } from '@/lib/api/institutions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Loader2, UserPlus } from 'lucide-react';

interface StudentFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  studentData?: Student | null;
}

export function StudentFormDialog({
  isOpen,
  onClose,
  onSuccess,
  studentData,
}: StudentFormDialogProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    isActive: true,
    institutionId: user?.institutionId || '',
  });

  useEffect(() => {
    if (studentData) {
      setFormData({
        firstName: studentData.firstName || '',
        lastName: studentData.lastName || '',
        email: studentData.email || '',
        phone: studentData.phone || '',
        isActive: studentData.isActive,
        institutionId: user?.institutionId || '',
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        isActive: true,
        institutionId: user?.institutionId || '',
      });
    }
  }, [studentData, user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (studentData) {
        // Update existing student
        await studentsApi.update(studentData.id, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          isActive: formData.isActive,
        });
        toast.success('Student updated successfully');
      } else {
        // Create new student
        await studentsApi.create({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          isActive: formData.isActive,
          institutionId: formData.institutionId,
        });
        toast.success('Student created successfully');
      }

      onSuccess?.();
    } catch (error: any) {
      console.error('Error saving student:', error);
      toast.error(
        error.response?.data?.message || 'Failed to save student'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            {studentData ? 'Edit Student' : 'Add Student'}
          </DialogTitle>
          <DialogDescription>
            {studentData
              ? 'Update student information below.'
              : 'Fill in the details to create a new student account.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) =>
                  handleInputChange('firstName', e.target.value)
                }
                placeholder="John"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) =>
                  handleInputChange('lastName', e.target.value)
                }
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="student@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                handleInputChange('isActive', !!checked)
              }
            />
            <Label htmlFor="isActive">Active Student</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {studentData ? 'Update Student' : 'Create Student'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}