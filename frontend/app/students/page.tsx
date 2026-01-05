'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  UserPlus,
  Search,
  Mail,
  MoreHorizontal,
  User,
  FileText,
  Upload,
} from 'lucide-react';
import { studentsApi, Student } from '@/lib/api/students';
import { CSVImportDialog } from '@/components/CSVImportDialog';
import { toast } from 'sonner';

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCSVImport, setShowCSVImport] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, [searchTerm, statusFilter]);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const response = await studentsApi.getAll({
        search: searchTerm || undefined,
      });

      if (response.success) {
        let filteredStudents = response.data;

        if (statusFilter !== 'all') {
          filteredStudents = filteredStudents.filter(
            (student) =>
              statusFilter === 'active' ? student.isActive : !student.isActive
          );
        }

        setStudents(filteredStudents);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
      toast.error('Failed to load students');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportSuccess = () => {
    setShowCSVImport(false);
    fetchStudents(); // Refresh the students list
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Students</h1>
              <p className="text-muted-foreground">
                Manage student records and enrollments
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowCSVImport(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Import CSV
              </Button>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Student
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Students</CardTitle>
              <CardDescription>
                View and manage all students in your institution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No students found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Classes</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                              <User className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <div className="font-medium">
                                {student.firstName} {student.lastName}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {student.email}
                          </div>
                        </TableCell>
                        <TableCell>{student.phone || '-'}</TableCell>
                        <TableCell>
                          <Badge
                            variant={student.isActive ? 'success' : 'secondary'}
                          >
                            {student.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {student.classes?.length || 0}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
        <CSVImportDialog 
          isOpen={showCSVImport}
          onClose={() => setShowCSVImport(false)}
          onSuccess={handleImportSuccess}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
