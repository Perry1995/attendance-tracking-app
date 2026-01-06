'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar,
  Download,
  FileText,
  BarChart3,
  Users,
  CalendarDays,
} from 'lucide-react';
import { format } from 'date-fns';
import { useEffect } from 'react';
import { classesApi, studentsApi, attendanceApi, reportsApi } from '@/lib/api';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'];

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState({
    start: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd'),
  });
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState('all');
  const [reportType, setReportType] = useState('attendance-summary');
  const [classes, setClasses] = useState<Array<{id: string; name: string; section?: string}>>([]);
  const [students, setStudents] = useState<Array<{id: string; firstName: string; lastName: string}>>([]);
  const [summary, setSummary] = useState<{present: number; absent: number; late: number; excused: number; attendanceRate: number} | null>(null);
  const [dailyData, setDailyData] = useState<Array<{date: string; present: number; absent: number}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchFilters();
  }, []);

  const fetchFilters = async () => {
    try {
      const [classesRes, studentsRes] = await Promise.all([
        classesApi.getClasses(),
        studentsApi.getStudents(),
      ]);
      if (classesRes.success) setClasses(classesRes.data);
      if (studentsRes.success) setStudents(studentsRes.data);
    } catch (error) {
      console.error('Failed to fetch filters:', error);
      toast.error('Failed to load filter data');
    }
  };

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const generateReport = async () => {
    setIsLoading(true);
    try {
      const params: {startDate: string; endDate: string; classId?: string; studentId?: string} = {
        startDate: dateRange.start,
        endDate: dateRange.end,
      };
      if (selectedClass !== 'all') params.classId = selectedClass;
      if (selectedStudent !== 'all') params.studentId = selectedStudent;

      const [summaryRes, dailyRes] = await Promise.all([
        attendanceApi.getSummary(params),
        attendanceApi.getDailySummary(params),
      ]);

      if (summaryRes.success) {
        setSummary(summaryRes.data);
      }
      if (dailyRes.success) {
        setDailyData(dailyRes.data);
      }
      toast.success('Report generated successfully');
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast.error('Failed to generate report');
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = async (formatType: 'pdf' | 'csv') => {
    setIsExporting(true);
    try {
      const filters = {
        startDate: dateRange.start,
        endDate: dateRange.end,
        classId: selectedClass !== 'all' ? selectedClass : undefined,
        studentId: selectedStudent !== 'all' ? selectedStudent : undefined,
      };

      if (formatType === 'pdf') {
        await reportsApi.exportAttendancePDF(filters);
      } else {
        await reportsApi.exportAttendanceCSV(filters);
      }
      toast.success(`Report exported as ${formatType.toUpperCase()}`);
    } catch (error) {
      console.error('Failed to export report:', error);
      toast.error(`Failed to export report as ${formatType.toUpperCase()}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Reports</h1>
              <p className="text-muted-foreground">
                Generate and export attendance reports
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => exportReport('pdf')}
                disabled={isExporting}
              >
                <Download className="mr-2 h-4 w-4" />
                {isExporting ? 'Exporting...' : 'Export PDF'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => exportReport('csv')}
                disabled={isExporting}
              >
                <Download className="mr-2 h-4 w-4" />
                {isExporting ? 'Exporting...' : 'Export CSV'}
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Date Range
                </CardTitle>
                <CardDescription>
                  Select the period for your report
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => handleDateRangeChange('start', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => handleDateRangeChange('end', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Report Filters</CardTitle>
                <CardDescription>
                  Customize your report parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Report Type</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="attendance-summary">Attendance Summary</SelectItem>
                      <SelectItem value="class-report">Class Report</SelectItem>
                      <SelectItem value="student-report">Student Report</SelectItem>
                      <SelectItem value="daily-attendance">Daily Attendance</SelectItem>
                      <SelectItem value="absence-report">Absence Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Class</Label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger>
                      <SelectValue />
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
                <div className="space-y-2">
                  <Label>Student (Optional)</Label>
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Students</SelectItem>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.firstName} {student.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Report Preview
              </CardTitle>
              <CardDescription>
                Generate and preview your selected report
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="summary" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="detailed">Detailed</TabsTrigger>
                  <TabsTrigger value="charts">Charts</TabsTrigger>
                </TabsList>
                
                <TabsContent value="summary" className="space-y-4">
                  {summary ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Attendance Summary Report</CardTitle>
                        <CardDescription>
                          {format(new Date(dateRange.start), 'MMM dd, yyyy')} - {format(new Date(dateRange.end), 'MMM dd, yyyy')}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
                          <div className="text-center p-4 border rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{summary.present}</div>
                            <div className="text-sm text-muted-foreground">Total Present</div>
                          </div>
                          <div className="text-center p-4 border rounded-lg">
                            <div className="text-2xl font-bold text-red-600">{summary.absent}</div>
                            <div className="text-sm text-muted-foreground">Total Absent</div>
                          </div>
                          <div className="text-center p-4 border rounded-lg">
                            <div className="text-2xl font-bold text-yellow-600">{summary.late}</div>
                            <div className="text-sm text-muted-foreground">Total Late</div>
                          </div>
                          <div className="text-center p-4 border rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{summary.attendanceRate}%</div>
                            <div className="text-sm text-muted-foreground">Attendance Rate</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground border rounded-lg">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Click &ldquo;Generate Report&rdquo; to see summary</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="detailed">
                  <Card>
                    <CardHeader>
                      <CardTitle>Detailed Attendance Records</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-center py-8 text-muted-foreground">
                          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Detailed report will be generated here</p>
                          <p className="text-sm">Click &ldquo;Generate Report&rdquo; to view detailed records</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="charts">
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Attendance Distribution</CardTitle>
                      </CardHeader>
                      <CardContent className="h-[300px]">
                        {summary ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  { name: 'Present', value: summary.present },
                                  { name: 'Absent', value: summary.absent },
                                  { name: 'Late', value: summary.late },
                                  { name: 'Excused', value: summary.excused },
                                ]}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {COLORS.map((color, index) => (
                                  <Cell key={`cell-${index}`} fill={color} />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground">
                            No data available
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Attendance Trend</CardTitle>
                      </CardHeader>
                      <CardContent className="h-[300px]">
                        {dailyData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={dailyData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Line
                                type="monotone"
                                dataKey="present"
                                stroke="#10b981"
                                activeDot={{ r: 8 }}
                              />
                              <Line type="monotone" dataKey="absent" stroke="#ef4444" />
                            </LineChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground">
                            No data available
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-6 flex justify-center">
                <Button onClick={generateReport} size="lg" disabled={isLoading}>
                  {isLoading ? (
                    'Generating...'
                  ) : (
                    <>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Quick Reports
              </CardTitle>
              <CardDescription>
                Access commonly used reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => {
                    const today = format(new Date(), 'yyyy-MM-dd');
                    setDateRange({ start: today, end: today });
                    generateReport();
                  }}
                >
                  <Users className="h-8 w-8" />
                  <div className="text-center">
                    <div className="font-medium">Today&apos;s Attendance</div>
                    <div className="text-sm text-muted-foreground">Quick daily report</div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => {
                    const end = format(new Date(), 'yyyy-MM-dd');
                    const start = format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
                    setDateRange({ start, end });
                    generateReport();
                  }}
                >
                  <CalendarDays className="h-8 w-8" />
                  <div className="text-center">
                    <div className="font-medium">Weekly Summary</div>
                    <div className="text-sm text-muted-foreground">Last 7 days</div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => {
                    const end = format(new Date(), 'yyyy-MM-dd');
                    const start = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd');
                    setDateRange({ start, end });
                    generateReport();
                  }}
                >
                  <BarChart3 className="h-8 w-8" />
                  <div className="text-center">
                    <div className="font-medium">Monthly Overview</div>
                    <div className="text-sm text-muted-foreground">Current month</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}