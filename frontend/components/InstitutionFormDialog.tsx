'use client';

import { useState, useEffect } from 'react';
import { institutionsApi, Institution } from '@/lib/api/institutions';
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Building2 } from 'lucide-react';

interface InstitutionFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  institutionData?: Institution | null;
}

export function InstitutionFormDialog({
  isOpen,
  onClose,
  onSuccess,
  institutionData,
}: InstitutionFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    isActive: true,
  });

  useEffect(() => {
    if (institutionData) {
      setFormData({
        name: institutionData.name || '',
        address: institutionData.address || '',
        phone: institutionData.phone || '',
        email: institutionData.email || '',
        website: institutionData.website || '',
        isActive: institutionData.isActive,
      });
    } else {
      setFormData({
        name: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        isActive: true,
      });
    }
  }, [institutionData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (institutionData) {
        // Update existing institution
        await institutionsApi.update(institutionData.id, formData);
        toast.success('Institution updated successfully');
      } else {
        // Create new institution
        await institutionsApi.create(formData);
        toast.success('Institution created successfully');
      }

      onSuccess?.();
    } catch (error: any) {
      console.error('Error saving institution:', error);
      toast.error(
        error.response?.data?.message || 'Failed to save institution'
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
            <Building2 className="h-5 w-5" />
            {institutionData ? 'Edit Institution' : 'Add Institution'}
          </DialogTitle>
          <DialogDescription>
            {institutionData
              ? 'Update institution information below.'
              : 'Fill in the details to create a new institution.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Institution Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Springfield Elementary School"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="123 Main Street, Springfield, IL 62701"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="contact@institution.edu"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="https://www.institution.edu"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {institutionData ? 'Update Institution' : 'Create Institution'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}