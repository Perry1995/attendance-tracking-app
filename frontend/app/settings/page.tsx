'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  User,
  Bell,
  Shield,
  Database,
  Palette,
  Key,
  Save,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/lib/api/auth';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
  });

  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    attendanceAlerts: true,
    absenceReminders: true,
    weeklyReports: false,
  });

  const [preferences, setPreferences] = useState({
    theme: 'system',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/dd/yyyy',
    timeFormat: '12h',
  });

  // Load preferences from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedNotifications = localStorage.getItem('notifications');
      const savedPreferences = localStorage.getItem('preferences');

      if (savedNotifications) {
        try {
          setNotifications(JSON.parse(savedNotifications));
        } catch (e) {
          console.error('Failed to parse notifications:', e);
        }
      }

      if (savedPreferences) {
        try {
          setPreferences(JSON.parse(savedPreferences));
        } catch (e) {
          console.error('Failed to parse preferences:', e);
        }
      }
    }
  }, []);

  const handleProfileUpdate = async () => {
    setIsLoading(true);
    try {
      await authApi.updateProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
      });
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (password.new !== password.confirm) {
      toast.error('New passwords do not match');
      return;
    }

    if (!password.current || !password.new) {
      toast.error('Please fill in all password fields');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.changePassword({
        currentPassword: password.current,
        newPassword: password.new,
      });
      
      setPassword({ current: '', new: '', confirm: '' });
      toast.success('Password changed successfully. Please log in again with your new password.');
    } catch (error) {
      console.error('Failed to change password:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    try {
      // Save to localStorage for now
      if (typeof window !== 'undefined') {
        localStorage.setItem('notifications', JSON.stringify(notifications));
      }
      toast.success('Notification preferences saved');
    } catch (error) {
      console.error('Failed to update notifications:', error);
      toast.error('Failed to save notification preferences');
    }
  };

  const handlePreferenceUpdate = async () => {
    try {
      // Save to localStorage for now
      if (typeof window !== 'undefined') {
        localStorage.setItem('preferences', JSON.stringify(preferences));
      }
      toast.success('Preferences saved');
    } catch (error) {
      console.error('Failed to update preferences:', error);
      toast.error('Failed to save preferences');
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>

          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Preferences
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                System
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information and contact details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={profile.firstName}
                        onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profile.lastName}
                        onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <Button onClick={handleProfileUpdate} disabled={isLoading}>
                    <Save className="mr-2 h-4 w-4" />
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Change Password
                  </CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={password.current}
                      onChange={(e) => setPassword(prev => ({ ...prev, current: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={password.new}
                      onChange={(e) => setPassword(prev => ({ ...prev, new: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={password.confirm}
                      onChange={(e) => setPassword(prev => ({ ...prev, confirm: e.target.value }))}
                    />
                  </div>
                  <Button onClick={handlePasswordChange} disabled={isLoading}>
                    <Key className="mr-2 h-4 w-4" />
                    {isLoading ? 'Changing...' : 'Change Password'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose how you want to be notified about attendance events
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Notifications</Label>
                        <div className="text-sm text-muted-foreground">
                          Receive notifications via email
                        </div>
                      </div>
                      <Switch
                        checked={notifications.emailNotifications}
                        onCheckedChange={(checked) =>
                          setNotifications(prev => ({ ...prev, emailNotifications: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Push Notifications</Label>
                        <div className="text-sm text-muted-foreground">
                          Receive browser push notifications
                        </div>
                      </div>
                      <Switch
                        checked={notifications.pushNotifications}
                        onCheckedChange={(checked) =>
                          setNotifications(prev => ({ ...prev, pushNotifications: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Attendance Alerts</Label>
                        <div className="text-sm text-muted-foreground">
                          Get notified when attendance is marked
                        </div>
                      </div>
                      <Switch
                        checked={notifications.attendanceAlerts}
                        onCheckedChange={(checked) =>
                          setNotifications(prev => ({ ...prev, attendanceAlerts: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Absence Reminders</Label>
                        <div className="text-sm text-muted-foreground">
                          Get reminders for repeated absences
                        </div>
                      </div>
                      <Switch
                        checked={notifications.absenceReminders}
                        onCheckedChange={(checked) =>
                          setNotifications(prev => ({ ...prev, absenceReminders: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Weekly Reports</Label>
                        <div className="text-sm text-muted-foreground">
                          Receive weekly attendance summaries
                        </div>
                      </div>
                      <Switch
                        checked={notifications.weeklyReports}
                        onCheckedChange={(checked) =>
                          setNotifications(prev => ({ ...prev, weeklyReports: checked }))
                        }
                      />
                    </div>
                  </div>
                  <Button onClick={handleNotificationUpdate}>
                    <Bell className="mr-2 h-4 w-4" />
                    Save Preferences
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Application Preferences</CardTitle>
                  <CardDescription>
                    Customize your application experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select value={preferences.theme} onValueChange={(value) => 
                      setPreferences(prev => ({ ...prev, theme: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select value={preferences.language} onValueChange={(value) => 
                      setPreferences(prev => ({ ...prev, language: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select value={preferences.timezone} onValueChange={(value) => 
                      setPreferences(prev => ({ ...prev, timezone: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="EST">Eastern Time</SelectItem>
                        <SelectItem value="PST">Pacific Time</SelectItem>
                        <SelectItem value="GMT">Greenwich Mean Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Date Format</Label>
                      <Select value={preferences.dateFormat} onValueChange={(value) => 
                        setPreferences(prev => ({ ...prev, dateFormat: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MM/dd/yyyy">MM/dd/yyyy</SelectItem>
                          <SelectItem value="dd/MM/yyyy">dd/MM/yyyy</SelectItem>
                          <SelectItem value="yyyy-MM-dd">yyyy-MM-dd</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Time Format</Label>
                      <Select value={preferences.timeFormat} onValueChange={(value) => 
                        setPreferences(prev => ({ ...prev, timeFormat: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12h">12 Hour</SelectItem>
                          <SelectItem value="24h">24 Hour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={handlePreferenceUpdate}>
                    <Palette className="mr-2 h-4 w-4" />
                    Save Preferences
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>System Information</CardTitle>
                  <CardDescription>
                    View system status and technical information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Application Version</Label>
                      <div className="text-sm text-muted-foreground">v1.0.0</div>
                    </div>
                    <div className="space-y-2">
                      <Label>Database Status</Label>
                      <div className="text-sm text-green-600">Connected</div>
                    </div>
                    <div className="space-y-2">
                      <Label>Last Backup</Label>
                      <div className="text-sm text-muted-foreground">Today at 3:00 AM</div>
                    </div>
                    <div className="space-y-2">
                      <Label>API Status</Label>
                      <div className="text-sm text-green-600">All Systems Operational</div>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <Button variant="outline">
                      <Database className="mr-2 h-4 w-4" />
                      Download System Logs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}