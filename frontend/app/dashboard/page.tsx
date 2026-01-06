'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardApi, DashboardStats, ActivityItem } from '@/lib/api/dashboard';
import { Users, BookOpen, UserCheck, UserX, AlertCircle, Activity } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const userRole = user?.roles?.[0]?.role || '';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResponse, activityResponse] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getRecentActivity(),
        ]);

        if (statsResponse.success) {
          setStats(statsResponse.data);
        }
        if (activityResponse.success) {
          setActivities(activityResponse.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getRoleBasedTitle = () => {
    switch (userRole) {
      case 'admin':
        return 'Admin Dashboard';
      case 'teacher':
        return 'Teacher Dashboard';
      case 'student':
        return 'My Attendance';
      case 'guardian':
        return 'Children\'s Attendance';
      default:
        return 'Dashboard';
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{getRoleBasedTitle()}</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.firstName} {user?.lastName}
            </p>
          </div>

          {(userRole === 'admin' || userRole === 'teacher') && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {userRole === 'admin' ? 'In your institution' : 'In your classes'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalClasses || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {userRole === 'admin' ? 'Active classes' : 'Assigned to you'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Present Today</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats?.presentToday || 0}</div>
                  <p className="text-xs text-muted-foreground">Marked as present</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
                  <UserX className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats?.absentToday || 0}</div>
                  <p className="text-xs text-muted-foreground">Marked as absent</p>
                </CardContent>
              </Card>

              {stats?.lateToday !== undefined && stats.lateToday > 0 && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Late Today</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">{stats.lateToday}</div>
                    <p className="text-xs text-muted-foreground">Arrived late</p>
                  </CardContent>
                </Card>
              )}

              {stats?.attendanceRate !== undefined && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {userRole === 'student' ? 'Attendance Rate (30d)' : 'Today\'s Rate'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.attendanceRate}%</div>
                    <p className="text-xs text-muted-foreground">
                      {userRole === 'student' ? 'Last 30 days' : 'Overall attendance'}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {userRole === 'student' && (
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Present (30 days)</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {stats?.presentLast30Days || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Days present</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Absent (30 days)</CardTitle>
                  <UserX className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats?.absentLast30Days || 0}</div>
                  <p className="text-xs text-muted-foreground">Days absent</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Late (30 days)</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats?.lateLast30Days || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Days late</p>
                </CardContent>
              </Card>
            </div>
          )}

          {userRole === 'guardian' && (
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Children</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
                  <p className="text-xs text-muted-foreground">Linked to your account</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Present Today</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats?.presentToday || 0}</div>
                  <p className="text-xs text-muted-foreground">Children present</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
                  <UserX className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats?.absentToday || 0}</div>
                  <p className="text-xs text-muted-foreground">Children absent</p>
                </CardContent>
              </Card>

              {stats?.lateToday !== undefined && stats.lateToday > 0 && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Late Today</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">{stats.lateToday}</div>
                    <p className="text-xs text-muted-foreground">Children late</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {stats && (userRole === 'admin' || userRole === 'teacher' || userRole === 'guardian') && (
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Summary</CardTitle>
                  <CardDescription>Today&apos;s attendance distribution</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Present', value: stats.presentToday || 0 },
                        { name: 'Absent', value: stats.absentToday || 0 },
                        { name: 'Late', value: stats.lateToday || 0 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value">
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {activities.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    <CardTitle>Recent Activity</CardTitle>
                  </div>
                  <CardDescription>Latest updates in your institution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activities.slice(0, 5).map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{activity.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {activity.description}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
