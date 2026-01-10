'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usersApi } from '@/lib/api/users';
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
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Upload,
  Download,
  FileText,
  AlertCircle,
  CheckCircle,
  X,
} from 'lucide-react';

interface CSVImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ImportResult {
  success: boolean;
  message: string;
  details?: {
    total: number;
    successful: number;
    failed: number;
    errors?: string[];
  };
}

export function CSVImportDialog({ isOpen, onClose, onSuccess }: CSVImportDialogProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);

  const downloadTemplate = () => {
    const template = `firstName,lastName,email,role,phone,studentId
John,Doe,john.doe@example.com,student,555-0101,STU001
Jane,Smith,jane.smith@example.com,student,555-0102,STU002
Bob,Johnson,bob.johnson@example.com,teacher,555-0103,TCH001
`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        alert('Please select a CSV file');
        return;
      }
      
      setSelectedFile(file);
      previewCSV(file);
    }
  };

  const previewCSV = async (file: File) => {
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        alert('CSV file must contain at least a header row and one data row');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const previewRows = lines.slice(1, 4).map(line => {
        const values = line.split(',').map(v => v.trim());
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });

      setPreviewData(previewRows);
    } catch (error) {
      console.error('Error previewing CSV:', error);
      alert('Error reading CSV file');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setProgress(0);
    setImportResult(null);

    let progressInterval: NodeJS.Timeout | null = null;

    try {
      // Parse CSV file and convert to JSON
      const text = await selectedFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV file must contain at least a header row and one data row');
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const users = lines.slice(1).map((line, index) => {
        const values = line.split(',').map(v => v.trim());
        const user: any = {
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          role: 'student',
        };

        headers.forEach((header, idx) => {
          const value = values[idx] || '';
          const lowerHeader = header.toLowerCase();

          if (lowerHeader.includes('firstname') || lowerHeader === 'firstname') {
            user.firstName = value;
          } else if (lowerHeader.includes('lastname') || lowerHeader === 'lastname') {
            user.lastName = value;
          } else if (lowerHeader.includes('email') || lowerHeader === 'email') {
            user.email = value;
          } else if (lowerHeader.includes('password') || lowerHeader === 'password') {
            user.password = value || 'defaultPassword123';
          } else if (lowerHeader.includes('role') || lowerHeader === 'role') {
            user.role = value || 'student';
          } else if (lowerHeader.includes('phone') || lowerHeader === 'phone') {
            user.phone = value;
          } else if (lowerHeader.includes('institution') || lowerHeader === 'institutionid') {
            user.institutionId = value;
          }
        });

        // Set default password if not provided
        if (!user.password) {
          user.password = 'defaultPassword123';
        }

        return user;
      });

      // Simulate progress for better UX
      let progress = 0;
      progressInterval = setInterval(() => {
        progress = Math.min(progress + 10, 90);
        setProgress(progress);
      }, 200);

      const response = await usersApi.bulkImportUsers({ users });
      
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      setProgress(100);

      setImportResult({
        success: true,
        message: 'Import completed successfully',
        details: {
          total: response.data?.total || users.length,
          successful: response.data?.successful || users.length,
          failed: response.data?.failed || 0,
          errors: response.data?.errors || [],
        },
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      setProgress(0);
      
      setImportResult({
        success: false,
        message: error.response?.data?.error || error.message || 'Import failed',
        details: {
          total: 0,
          successful: 0,
          failed: 1,
          errors: [error.message || 'Unknown error'],
        },
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setImportResult(null);
    setPreviewData([]);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk Import Users
          </DialogTitle>
          <DialogDescription>
            Import multiple users from a CSV file. Download the template to get started.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Download */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">CSV Template</div>
                <div className="text-sm text-muted-foreground">
                  Download the template with correct headers
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="csv-file">Select CSV File</Label>
            <Input
              ref={fileInputRef}
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="cursor-pointer"
            />
          </div>

          {/* Preview */}
          {previewData.length > 0 && (
            <div className="space-y-2">
              <Label>Preview (First 3 rows)</Label>
              <div className="border rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      {Object.keys(previewData[0] || {}).map((header) => (
                        <th key={header} className="px-3 py-2 text-left">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, index) => (
                      <tr key={index} className="border-t">
                        {Object.values(row).map((value: any, cellIndex) => (
                          <td key={cellIndex} className="px-3 py-2">
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading and processing...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Result */}
          {importResult && (
            <Alert className={importResult.success ? 'border-green-200' : 'border-red-200'}>
              <div className="flex items-start gap-2">
                {importResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <AlertDescription>
                    <div className="font-medium">{importResult.message}</div>
                    {importResult.details && (
                      <div className="mt-2 text-sm">
                        <div>Total: {importResult.details.total}</div>
                        <div className="text-green-600">Successful: {importResult.details.successful}</div>
                        <div className="text-red-600">Failed: {importResult.details.failed}</div>
                        {importResult.details.errors && importResult.details.errors.length > 0 && (
                          <div className="mt-2">
                            <div className="font-medium">Errors:</div>
                            <ul className="list-disc list-inside mt-1">
                              {importResult.details.errors.map((error, index) => (
                                <li key={index}>{error}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || isUploading}
            >
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? 'Importing...' : 'Import Users'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}