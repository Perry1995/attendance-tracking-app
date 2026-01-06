'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usersApi, User } from '@/lib/api/users';
import { institutionsApi } from '@/lib/api/institutions';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, UserPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface UserFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  user?: User | null;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password?: string;
  role: string;
  institutionId: string;
}

export function UserFormDialog({ isOpen, onClose, onSuccess, user }: UserFormDialogProps) {
  const { user: currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: 'student',
    institutionId: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchInstitutions();
      if (user) {
        // Edit mode - populate form with user data
        setFormData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: user.phone || '',
          role: user.roles?.[0]?.role || 'student',
          institutionId: user.roles?.[0]?.institutionId || '',
        });
      } else {
        // Create mode - reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          password: '',
          role: 'student',
          institutionId: '',
        });
      }
      setError(null);
    }
  }, [isOpen, user]);

  const fetchInstitutions = async () => {
    try {
      const response = await institutionsApi.getAll();
      if (response.success) {
        setInstitutions(response.data);
        // Set default institution if only one exists or from current user
        if (response.data.length === 1) {
          setFormData(prev => ({ ...prev, institutionId: response.data[0].id }));
        } else if (currentUser?.roles?.[0]?.institutionId) {
          setFormData(prev => ({ ...prev, institutionId: currentUser.roles[0].institutionId }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch institutions:', error);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Valid email is required');
      return false;
    }
    if (!user && !formData.password) {
      setError('Password is required for new users');
      return false;
    }
    if (!user && formData.password && formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (!formData.role) {
      setError('Role is required');
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
      if (user) {
        // Update existing user
        const updateData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
        };
        const response = await usersApi.updateUser(user.id, updateData);
        
        if (response.success) {
          // If role changed, update role
          if (formData.role !== user.roles?.[0]?.role || formData.institutionId !== user.roles?.[0]?.institutionId) {
            await usersApi.assignRole(user.id, formData.institutionId, formData.role);
          }
          toast.success('User updated successfully');
          if (onSuccess) onSuccess();
          onClose();
        }
      } else {
        // Register a new user - use the auth register endpoint
        const registerData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password!,
        };
        
        // Register the user first
        const authResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(registerData),
        });
        
        if (!authResponse.ok) {
          const errorData = await authResponse.json();
          throw new Error(errorData.error || 'Failed to create user');
        }
        
        const result = await authResponse.json();
        const newUserId = result.data.user.id;
        
        // Then assign the role
        await usersApi.assignRole(newUserId, formData.institutionId, formData.role);
        
        toast.success('User created successfully');
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (error: any) {
      console.error('Failed to save user:', error);
      setError(error.message || 'Failed to save user');
      toast.error(error.message || 'Failed to save user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        role: 'student',
        institutionId: '',
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
            <UserPlus className="h-5 w-5" />
            {user ? 'Edit User' : 'Add New User'}
          </DialogTitle>
          <DialogDescription>
            {user ? 'Update user information and role' : 'Create a new user account and assign a role'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="John"
                disabled={isSubmitting}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder="Doe"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="john.doe@example.com"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
              disabled={isSubmitting}
            />
          </div>

          {!user && (
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="Min 8 characters"
                disabled={isSubmitting}
                required
              />
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters with uppercase, lowercase, number, and special character
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleChange('role', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="guardian">Guardian</SelectItem>
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
              {user ? 'Update User' : 'Create User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
