'use client';

import { useState, useEffect } from 'react';
import { institutionsApi, Institution } from '@/lib/api/institutions';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Building, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface InstitutionFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  institution?: Institution | null;
}

interface FormData {
  name: string;
  code: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
}

export function InstitutionFormDialog({ 
  isOpen, 
  onClose, 
  onSuccess, 
  institution 
}: InstitutionFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    code: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
  });

  useEffect(() => {
    if (isOpen) {
      if (institution) {
        // Edit mode
        setFormData({
          name: institution.name || '',
          code: institution.code || '',
          description: institution.description || '',
          address: institution.address || '',
          phone: institution.phone || '',
          email: institution.email || '',
          website: institution.website || '',
        });
      } else {
        // Create mode
        setFormData({
          name: '',
          code: '',
          description: '',
          address: '',
          phone: '',
          email: '',
          website: '',
        });
      }
      setError(null);
    }
  }, [isOpen, institution]);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Institution name is required');
      return false;
    }
    if (!formData.code.trim()) {
      setError('Institution code is required');
      return false;
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Valid email is required');
      return false;
    }
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      setError('Valid website URL is required (e.g., https://example.com)');
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
        code: formData.code,
        description: formData.description || null,
        address: formData.address || null,
        phone: formData.phone || null,
        email: formData.email || null,
        website: formData.website || null,
      };

      if (institution) {
        // Update existing institution
        const response = await institutionsApi.update(institution.id, submitData);
        if (response.success) {
          toast.success('Institution updated successfully');
          if (onSuccess) onSuccess();
          onClose();
        }
      } else {
        // Create new institution
        const response = await institutionsApi.create(submitData);
        if (response.success) {
          toast.success('Institution created successfully');
          if (onSuccess) onSuccess();
          onClose();
        }
      }
    } catch (error: any) {
      console.error('Failed to save institution:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to save institution';
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
        code: '',
        description: '',
        address: '',
        phone: '',
        email: '',
        website: '',
      });
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            {institution ? 'Edit Institution' : 'Create New Institution'}
          </DialogTitle>
          <DialogDescription>
            {institution ? 'Update institution information' : 'Add a new educational institution to the system'}
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
            <Label htmlFor="name">Institution Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Springfield High School"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Institution Code *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
              placeholder="e.g., SHS2024"
              disabled={isSubmitting}
              required
            />
            <p className="text-xs text-muted-foreground">
              A unique identifier for the institution
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Brief description of the institution..."
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Street address, city, state, ZIP"
              disabled={isSubmitting}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="info@institution.edu"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              placeholder="https://www.institution.edu"
              disabled={isSubmitting}
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
              {institution ? 'Update Institution' : 'Create Institution'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
