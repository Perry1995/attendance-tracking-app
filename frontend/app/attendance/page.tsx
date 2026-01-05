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
import { useState } from 'react';

// Mock data for demonstration
const mockAttendanceRecords = [
  {
    id: '1',
    student: { firstName: 'Alice', lastName: 'Johnson', email: 'alice@school.edu' },
    status: 'present',
    checkInTime: '08:00 AM',
  },
  {
    id: '2',
    student: { firstName: 'Bob', lastName: 'Smith', email: 'bob@school.edu' },
    status: 'late',
    checkInTime: '08:15 AM',
  },
  {
    id: '3',
    student: { firstName: 'Carol', lastName: 'Williams', email: 'carol@school.edu' },
    status: 'absent',
    checkInTime: null,
  },
  {
    id: '4',
    student: { firstName: 'David', lastName: 'Brown', email: 'david@school.edu' },
    status: 'present',
    checkInTime: '07:55 AM',
  },
];

const statusColors = {
  present: 'success',
  absent: 'destructive',
  late: 'warning',
  excused: 'secondary',
};

export default function AttendancePage() {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedClass, setSelectedClass] = useState('all');

  const presentCount = mockAttendanceRecords.filter(
    (r) => r.status === 'present'
  ).length;
  const absentCount = mockAttendanceRecords.filter(
    (r) => r.status === 'absent'
  ).length;
  const lateCount = mockAttendanceRecords.filter(
    (r) => r.status === 'late'
  ).length;

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
                  {Math.round(
                    ((presentCount + lateCount) /
                      mockAttendanceRecords.length) *
                      100
                  )}
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
                      <SelectItem value="math-101">Mathematics 101 - A</SelectItem>
                      <SelectItem value="physics">Physics - B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAttendanceRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <span className="font-medium">
                          {record.student.firstName.charAt(0)}
                          {record.student.lastName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">
                          {record.student.firstName} {record.student.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {record.student.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {record.checkInTime && (
                        <div className="text-sm text-muted-foreground">
                          Check-in: {record.checkInTime}
                        </div>
                      )}
                      <Select defaultValue={record.status}>
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
                <Button>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Save Attendance
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
