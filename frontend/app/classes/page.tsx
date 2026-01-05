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
  BookOpen,
  Plus,
  Search,
  Users,
  Calendar,
  MoreHorizontal,
} from 'lucide-react';
import { classesApi, Class } from '@/lib/api/classes';
import { toast } from 'sonner';

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [academicYear, setAcademicYear] = useState('all');

  useEffect(() => {
    fetchClasses();
  }, [searchTerm, academicYear]);

  const fetchClasses = async () => {
    try {
      setIsLoading(true);
      const response = await classesApi.getAll({
        academicYear: academicYear !== 'all' ? academicYear : undefined,
      });

      let filteredClasses = response;

      if (searchTerm) {
        filteredClasses = filteredClasses.filter((classItem) =>
          classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          classItem.section?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          classItem.gradeLevel?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setClasses(filteredClasses);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      toast.error('Failed to load classes');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Classes</h1>
              <p className="text-muted-foreground">
                Manage your classes and sections
              </p>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Class
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Classes</CardTitle>
              <CardDescription>
                View and manage all classes in your institution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search classes..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={academicYear} onValueChange={setAcademicYear}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Academic Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    <SelectItem value="2024-2025">2024-2025</SelectItem>
                    <SelectItem value="2023-2024">2023-2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : classes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No classes found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class Name</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Grade Level</TableHead>
                      <TableHead>Academic Year</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead className="text-center">Students</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classes.map((classItem) => (
                      <TableRow key={classItem.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            {classItem.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{classItem.section || '-'}</Badge>
                        </TableCell>
                        <TableCell>{classItem.gradeLevel || '-'}</TableCell>
                        <TableCell>{classItem.academicYear}</TableCell>
                        <TableCell>
                          {classItem.teacher
                            ? `${classItem.teacher.firstName} ${classItem.teacher.lastName}`
                            : 'Not assigned'}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            {classItem.studentCount || 0}
                          </div>
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
      </DashboardLayout>
    </ProtectedRoute>
  );
}
