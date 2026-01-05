import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import {
  BarChart3,
  Download,
  Calendar as CalendarIcon,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';

export default function ReportsPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedClass, setSelectedClass] = useState('all');

  const stats = {
    overallAttendance: 94.5,
    totalStudents: 120,
    averageCheckIn: '8:05 AM',
    perfectAttendance: 85,
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Reports</h1>
              <p className="text-muted-foreground">
                View attendance analytics and generate reports
              </p>
            </div>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Overall Attendance
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overallAttendance}%</div>
                <p className="text-xs text-muted-foreground">
                  +2.5% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Students
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalStudents}</div>
                <p className="text-xs text-muted-foreground">
                  Across all classes
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg. Check-in Time
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageCheckIn}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Perfect Attendance
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.perfectAttendance}</div>
                <p className="text-xs text-muted-foreground">
                  Students with no absences
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Trends</CardTitle>
                <CardDescription>
                  Daily attendance overview for the selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
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

                <div className="h-[200px] flex items-center justify-center border-2 border-dashed rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                    <p>Chart visualization will appear here</p>
                    <p className="text-sm">
                      Connect to a charting library for data visualization
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Absences</CardTitle>
                <CardDescription>
                  Students with highest absence rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'John Smith', absences: 8, rate: '15%' },
                    { name: 'Emily Davis', absences: 6, rate: '12%' },
                    { name: 'Michael Wilson', absences: 5, rate: '10%' },
                    { name: 'Sarah Brown', absences: 4, rate: '8%' },
                    { name: 'David Lee', absences: 3, rate: '6%' },
                  ].map((student, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{student.name}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {student.absences} absences
                        </span>
                        <Badge variant="destructive">{student.rate}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Summary</CardTitle>
              <CardDescription>
                Attendance breakdown by month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-12">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, index) => {
                  const rate = [92, 88, 95, 91, 94, 96][index];
                  return (
                    <div key={month} className="col-span-2">
                      <div className="text-center mb-2">
                        <span className="text-sm font-medium">{month}</span>
                      </div>
                      <div className="h-32 bg-muted rounded-lg relative">
                        <div
                          className={`absolute bottom-0 left-0 right-0 rounded-lg ${
                            rate >= 95
                              ? 'bg-green-500'
                              : rate >= 90
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ height: `${rate}%` }}
                        />
                      </div>
                      <div className="text-center mt-2">
                        <span className="text-sm text-muted-foreground">
                          {rate}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
