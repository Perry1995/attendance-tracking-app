'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Download, RefreshCw } from 'lucide-react';
import { attendanceApi, AttendanceRecord } from '@/lib/api/attendance';
import { classesApi } from '@/lib/api/classes';
import { toast } from 'sonner';

const statusColors = {
  present: 'success',
  absent: 'destructive',
  late: 'warning',
  excused: 'secondary',
};

export default function AttendancePage() {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedClass, setSelectedClass] = useState('all');
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [date, selectedClass]);

  const fetchClasses = async () => {
    try {
      const response = await classesApi.getClasses();
      if (response.success) {
        setClasses(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      toast.error('Failed to load classes');
    }
  };

  const fetchAttendance = async () => {
    try {
      setIsLoading(true);
      const formattedDate = format(date, 'yyyy-MM-dd');

      let response;
      if (selectedClass !== 'all') {
        response = await attendanceApi.getClassAttendance(selectedClass, formattedDate);
      } else {
        response = await attendanceApi.getRecords({
          date: formattedDate,
        });
      }

      if (response.success) {
        setAttendanceRecords(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
      toast.error('Failed to load attendance records');
    } finally {
      setIsLoading(false);
    }
  };

  const presentCount = attendanceRecords.filter(
    (r) => r.status === 'present'
  ).length;
  const absentCount = attendanceRecords.filter(
    (r) => r.status === 'absent'
  ).length;
  const lateCount = attendanceRecords.filter(
    (r) => r.status === 'late'
  ).length;

  const handleStatusChange = (recordId: string, newStatus: string) => {
    setAttendanceRecords(records =>
      records.map(record =>
        record.id === recordId
          ? { ...record, status: newStatus as any }
          : record
      )
    );
  };

  const handleSaveAttendance = async () => {
    if (selectedClass === 'all') {
      toast.warning('Please select a specific class to save attendance');
      return;
    }

    try {
      setIsSaving(true);
      const formattedDate = format(date, 'yyyy-MM-dd');

      await attendanceApi.create({
        classId: selectedClass,
        date: formattedDate,
        records: attendanceRecords.map(r => ({
          studentId: r.studentId,
          status: r.status,
        })),
      });

      toast.success('Attendance saved successfully');
    } catch (error) {
      console.error('Failed to save attendance:', error);
      toast.error('Failed to save attendance');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Attendance</h1>
              <p className="text-muted-foreground">
                Track and manage student attendance
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Present</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {presentCount}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Absent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {absentCount}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Late</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {lateCount}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {attendanceRecords.length > 0
                    ? Math.round(
                        ((presentCount + lateCount) / attendanceRecords.length) * 100
                      )
                    : 0}
                  %
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Daily Attendance</CardTitle>
                  <CardDescription>
                    Record attendance for each student
                  </CardDescription>
                </div>
                <div className="flex gap-4">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-[240px] justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? (
                          format(date, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(date) => date && setDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Select
                    value={selectedClass}
                    onValueChange={setSelectedClass}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name} {cls.section ? `- ${cls.section}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : attendanceRecords.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No attendance records found. Select a class to view or record attendance.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {attendanceRecords.map((record) => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            <span className="font-medium">
                              {record.student?.firstName?.charAt(0)}
                              {record.student?.lastName?.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">
                              {record.student?.firstName} {record.student?.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {record.student?.email}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {record.checkInTime && (
                            <div className="text-sm text-muted-foreground">
                              Check-in: {new Date(record.checkInTime).toLocaleTimeString()}
                            </div>
                          )}
                          <Select
                            value={record.status}
                            onValueChange={(value) => handleStatusChange(record.id, value)}
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="present">Present</SelectItem>
                              <SelectItem value="absent">Absent</SelectItem>
                              <SelectItem value="late">Late</SelectItem>
                              <SelectItem value="excused">Excused</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button onClick={handleSaveAttendance} disabled={isSaving || selectedClass === 'all'}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      {isSaving ? 'Saving...' : 'Save Attendance'}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
